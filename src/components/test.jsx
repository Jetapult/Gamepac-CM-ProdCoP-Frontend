import React from 'react';
import { useState } from 'react';
import { gapi } from 'gapi-script';
import docs from '../assets/docs.png';

const Test = ({ getDataForGoogleDoc }) => {
    const [googleDocId, setGoogleDocId] = useState('');
    const [loading, setLoading] = useState(false);
  
    const createEmptyGoogleDoc = () => {
      const { label,summaryList, todos ,purpose,} = getDataForGoogleDoc();
      setLoading(true);
  
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
                    title: label,
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
];

let currentIndex ='Summary:\n'.length;


// Add each item in the summary list as a bullet point
summaryList.forEach((summaryItem) => {
  const text = `- ${summaryItem}\n`;
  content.push(
    {
      insertText: {
        location: { index: currentIndex },
        text: text,
      },
    }
  );
  currentIndex += text.length;
});

const todoListTitle = '\nTodo List:\n';
content.push(
  {
    insertText: {
      location: { index: currentIndex },
      text: todoListTitle,
    },
  },
);

currentIndex += todoListTitle.length;

// Add each item in the todos list as a bullet point
todos.forEach((todo) => {
  const text = `- ${todo}\n`;
  content.push(
    {
      insertText: {
        location: { index: currentIndex },
        text: text,
      },
    }
  );
  currentIndex += text.length;
});
                    gapi.client.docs.documents.batchUpdate({
                      documentId: docId,
                      resource: { requests: content },
                    }).then(() => {
                      setGoogleDocId(docId);
                      setLoading(false); // Set loading state to false
                    });
                  });
                });
              });
            });
          };
          
    return (
      <div>
      {googleDocId ? (
        

        <button
  className="bg-[#f1efe7] py-2 px-4 rounded-md hover:scale-105 focus:outline-none focus:ring focus:border-gray-400"
  onClick={() => window.open(`https://docs.google.com/document/d/${googleDocId}`, '_blank')}
>
<span style={{ display: 'flex', alignItems: 'center' }}>
    <img src={docs} alt="Google Docs Logo" style={{ width: '20px', marginRight: '5px' }} />
    Doc Created!{' '}
          </span>
</button>
      ) :  (
        <div>
          {loading ? (
            <button className="bg-[#f1efe7] py-2 px-4 rounded-md hover:scale-105 focus:outline-none focus:ring focus:border-gray-400" disabled>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Creating...
              </span>
            </button>
          ) : (
            <button
              className="bg-[#f1efe7] py-2 px-4 rounded-md hover:scale-105 focus:outline-none focus:ring focus:border-gray-400"
              onClick={createEmptyGoogleDoc}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <img src={docs} alt="Google Docs Logo" style={{ width: '20px', marginRight: '5px' }} />
                Convert to Google Doc
              </span>
            </button>
          )}
        </div>
      )}
    </div>
    );
  };

export default Test;
