/**
 * @fileOverview Service for interacting with the Google Forms API.
 */

// This service is designed to be used on the server-side (within Genkit flows)
// to securely interact with the Google Forms API on behalf of the user.

export interface Question {
  question: string;
  type: 'RADIO' | 'CHECKBOX';
  options: string[];
}

export class GoogleFormsService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createForm(title: string, description: string): Promise<string> {
    const response = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title,
          documentTitle: title,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Google Forms API error (createForm):', response.status, errorBody);
      throw new Error(`Google Forms API error: ${response.statusText}`);
    }

    const form = await response.json();
    return form.formId;
  }

  async addQuizQuestions(formId: string, questions: Question[]): Promise<void> {
    if (!questions || questions.length === 0) {
        return;
    }

    const requests = questions.map((question, index) => ({
      createItem: {
        item: {
          title: question.question,
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: question.type,
                options: question.options.map((option: string) => ({
                  value: option,
                })),
                shuffle: false,
              },
            },
          },
        },
        location: {
          index: index,
        },
      },
    }));

    const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests,
        includeFormInResponse: false,
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Google Forms API error (addQuizQuestions):', response.status, errorBody);
        throw new Error(`Google Forms API error: ${response.statusText}`);
    }
  }

  async getForm(formId: string): Promise<any> {
    const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: {
            'Authorization': `Bearer ${this.accessToken}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Google Forms API error (getForm):', response.status, errorBody);
        throw new Error(`Google Forms API error: ${response.statusText}`);
    }

    return await response.json();
  }
}
