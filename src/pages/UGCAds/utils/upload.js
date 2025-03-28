import { generateId } from "@designcombo/timeline";

const BASE_URL = "https://transcribe.designcombo.dev/presigned-url";

export const createUploadsDetails = async (
  fileName
) => {
  const currentFormat = fileName.split(".").pop();
  const uniqueFileName = `${generateId()}`;
  const updatedFileName = `${uniqueFileName}.${currentFormat}`;
  const response = await fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({ fileName: updatedFileName })
  });

  const data = await response.json();
  return {
    uploadUrl: data.presigned_url,
    url: data.url,
    name: updatedFileName,
    id: uniqueFileName
  };
};
