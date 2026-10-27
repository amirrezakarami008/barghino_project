import fakeredis
import pytest

from apps.core.redis import build_key, connection_manager, get_redis, redis_client
from apps.core.redis.serializers import deserialize, serialize


@pytest.fixture
def fake_redis():
    server = fakeredis.FakeServer()
    default = fakeredis.FakeRedis(server=server)
    streams = fakeredis.FakeRedis(server=server)
    connection_manager.reset()
    connection_manager.configure({"default": default, "streams": streams})
    yield default
    connection_manager.reset()


@pytest.fixture
def redis_service(fake_redis):
    return get_redis("default")


def test_serialize_roundtrip():
    assert deserialize(serialize("hello")) == "hello"
    assert deserialize(serialize("42")) == "42"
    assert deserialize(serialize(42)) == 42
    assert deserialize(serialize({"a": 1})) == {"a": 1}
    assert deserialize(serialize(b"raw")) == b"raw"
    assert deserialize(None) is None


def test_build_key(settings):
    settings.REDIS_KEY_PREFIX = "backend"
    assert build_key("accounts", "otp", "0912") == "backend:accounts:otp:0912"
    assert build_key("a", "", "b") == "backend:a:b"


def test_unknown_connection_raises(fake_redis):
    with pytest.raises(ValueError, match="Unknown Redis connection"):
        _ = get_redis("missing").raw


def test_kv_set_get_delete_exists(redis_service):
    key = build_key("test", "kv")
    assert redis_service.set(key, {"n": 1}, ttl=60) is True
    assert redis_service.get(key) == {"n": 1}
    assert redis_service.exists(key) is True
    assert redis_service.delete(key) == 1
    assert redis_service.get(key) is None


def test_incr(redis_service):
    key = build_key("test", "counter")
    assert redis_service.incr(key) == 1
    assert redis_service.incr(key, 4) == 5


def test_expire_and_ttl(redis_service):
    key = build_key("test", "ttl")
    redis_service.set(key, 1)
    assert redis_service.ttl(key) == -1
    assert redis_service.expire(key, 30) is True
    assert 0 < redis_service.ttl(key) <= 30
    assert redis_service.ttl(build_key("test", "missing")) == -2


def test_hash_operations(redis_service):
    key = build_key("test", "hash")
    redis_service.hset(key, {"name": "Ada", "score": 10})
    assert redis_service.hget(key, "name") == "Ada"
    assert redis_service.hgetall(key) == {"name": "Ada", "score": 10}
    assert redis_service.hdel(key, "score") == 1
    assert redis_service.hget(key, "score") is None


def test_streams_xadd_xread(redis_service):
    stream = build_key("test", "stream")
    entry_id = redis_service.xadd(stream, {"order_id": "42", "meta": {"ok": True}})
    assert entry_id

    rows = redis_service.xread({stream: "0-0"}, count=10)
    assert len(rows) == 1
    name, messages = rows[0]
    assert name == stream
    assert messages[0][1]["order_id"] == "42"
    assert messages[0][1]["meta"] == {"ok": True}


def test_streams_consumer_group(redis_service):
    stream = build_key("test", "orders")
    group = "workers"
    assert redis_service.xgroup_create(stream, group) is True
    assert redis_service.xgroup_create(stream, group) is False  # BUSYGROUP

    redis_service.xadd(stream, {"id": "1"})
    rows = redis_service.xreadgroup(group, "c1", {stream: ">"}, count=1)
    assert len(rows) == 1
    _, messages = rows[0]
    msg_id, fields = messages[0]
    assert fields["id"] == "1"
    assert redis_service.xack(stream, group, msg_id) == 1


def test_lock_acquire_and_release(redis_service):
    key = build_key("test", "lock")
    assert redis_service.acquire_lock(key, "token-a", ttl=30) is True
    assert redis_service.acquire_lock(key, "token-b", ttl=30) is False
    assert redis_service.release_lock(key, "token-b") is False
    assert redis_service.release_lock(key, "token-a") is True
    assert redis_service.acquire_lock(key, "token-b", ttl=30) is True


def test_using_switches_connection(fake_redis):
    default = get_redis("default")
    streams = default.using("streams")
    assert streams.connection_name == "streams"
    streams.set("s:key", "v")
    assert streams.get("s:key") == "v"


def test_redis_client_lazy_alias(redis_service):
    key = build_key("test", "alias")
    assert redis_client.set(key, "via-alias") is True
    assert redis_client.get(key) == "via-alias"


def test_close_all(fake_redis):
    svc = get_redis()
    svc.set("k", "v")
    connection_manager.close_all()
    # After close_all overrides are cleared; reconfigure for cleanup safety
    connection_manager.configure({"default": fakeredis.FakeRedis()})
