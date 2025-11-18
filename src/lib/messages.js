// Message type definitions

export function toAISDKMessages(messages) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content.map((content) => {
      if (content.type === 'code') {
        return {
          type: 'text',
          text: content.text,
        };
      }

      return content;
    }),
  }));
}

export async function toMessageImage(files) {
  if (files.length === 0) {
    return [];
  }

  return Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      return `data:${file.type};base64,${base64}`;
    })
  );
}
