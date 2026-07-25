export { DocumentsManager } from "./components/DocumentsManager";
export { DocumentUpload } from "./components/DocumentUpload";
export { useUserDocuments } from "./hooks/useUserDocuments";
export {
  getAllUserDocuments,
  uploadUserDocument,
  removeUserDocument,
} from "./lib/store";
export { DOCUMENT_CATEGORIES } from "./constants";
export type { UserDocument, DocumentCategory } from "./types";
