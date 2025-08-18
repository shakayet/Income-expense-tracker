type IFolderName = 'image' | 'media' | 'doc';

type FileObject = { filename: string };
type FilesMap = Record<IFolderName, FileObject[]> | undefined;

//single file
export const getSingleFilePath = (
  files: FilesMap,
  folderName: IFolderName
): string | undefined => {
  const fileField = files && files[folderName];
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    return `/${folderName}/${fileField[0].filename}`;
  }
  return undefined;
};

//multiple files
export const getMultipleFilesPath = (
  files: FilesMap,
  folderName: IFolderName
): string[] | undefined => {
  const folderFiles = files && files[folderName];
  if (folderFiles && Array.isArray(folderFiles)) {
    return folderFiles.map(
      (file: FileObject) => `/${folderName}/${file.filename}`
    );
  }
  return undefined;
};
