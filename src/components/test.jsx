import React from 'react';
import { useState } from 'react';
import { gapi } from 'gapi-script';

const Test = ({ getDataForGoogleDoc }) => {
    const [googleDocId, setGoogleDocId] = useState('');
  
    const createEmptyGoogleDoc = () => {
      const { summary, todos } = getDataForGoogleDoc();
  
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: 'AIzaSyB0IMQWvmiL6a2WY5PkzNF9_C2oN-0DRIs',
          clientId: '1070556759963-k89rkske02qmchrs8od67nq9gmpvs391.apps.googleusercontent.com',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          scope: 'https://www.googleapis.com/auth/documents',
        });
  
              gapi.client.load('docs', 'v1', () => {
                gapi.auth2.getAuthInstance().signIn().then(() => {
                  const request = {
                    title: 'Empty Document',
                  };
          
                  // Create an empty Google Doc
                  gapi.client.docs.documents.create(request).then((response) => {
                    const docId = response.result.documentId;
          
                    // Initialize content array
                    const content = [
                      {
                        insertText: {
                          location: { index: 1 },
                          text: 'Summary:\n',
                        },
                      },
                      {
                        insertText: {
                          location: { index: 9 },
                          text: `${summary}`+'\n',
                        },
                      },
                      {
                        insertText: {
                          location: { index: 10 + summary.length },
                          text: 'Todo List:'+'\n',
                        },
                      },
                    ];
                    const reversedTodos = [...todos].reverse();

                    // Add each item in the reversed todos list as a bullet point
                    reversedTodos.forEach((todo, index) => {
                      content.push(
                        {
                          insertText: {
                            location: { index: 20 + summary.length + index },
                            text: `- ${todo}\n`,
                          },
                        }
                      );
                    });
                
                    gapi.client.docs.documents.batchUpdate({
                      documentId: docId,
                      resource: { requests: content },
                    }).then(() => {
                      setGoogleDocId(docId);
                    });
                  });
                });
              });
            });
          };
          
    return (
      <div>
        <button onClick={createEmptyGoogleDoc}>Convert to Google Doc</button>
        {googleDocId && (
          <p>
            Document created!{' '}
            <a
              href={`https://docs.google.com/document/d/${googleDocId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Google Doc
            </a>
          </p>
        )}
      </div>
    );
  };
  
//   export default Test;
  

export default Test;
