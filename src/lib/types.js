// Types for code execution results
// These are frontend-only types - your backend should return data matching these structures

// ExecutionError type
// {
//   name: string
//   value: string
//   traceback: string
// }

// Result type
// {
//   text?: string
//   html?: string
//   png?: string
//   jpeg?: string
//   json?: any
//   svg?: string
//   pdf?: string
//   latex?: string
//   markdown?: string
// }

// ExecutionResultInterpreter type
// {
//   sbxId: string
//   template: string
//   stdout: string[]
//   stderr: string[]
//   runtimeError?: ExecutionError
//   cellResults: Result[]
// }

// ExecutionResultWeb type
// {
//   sbxId: string
//   template: string
//   url: string
// }

// ExecutionResult = ExecutionResultInterpreter | ExecutionResultWeb

export const createPlaceholderExecutionResult = (template) => {
  if (template === 'code-interpreter-v1') {
    return {
      sbxId: 'placeholder-sandbox-id',
      template,
      stdout: ['Placeholder output'],
      stderr: [],
      cellResults: [
        {
          text: 'This is a placeholder result. Backend integration needed.',
        },
      ],
    };
  }

  return {
    sbxId: 'placeholder-sandbox-id',
    template,
    url: 'http://localhost:3000',
  };
};
