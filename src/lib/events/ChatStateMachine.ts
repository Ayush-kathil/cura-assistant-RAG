export type ChatState = 
  | 'IDLE'
  | 'SUBMITTING'
  | 'ANALYZING'
  | 'RETRIEVING'
  | 'RERANKING'
  | 'GENERATING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED';

export class ChatStateMachine {
  private currentState: ChatState = 'IDLE';
  private listeners: ((state: ChatState) => void)[] = [];

  public getState(): ChatState {
    return this.currentState;
  }

  public transition(newState: ChatState) {
    // Basic state transition validation could be added here
    this.currentState = newState;
    this.notify();
  }

  public subscribe(listener: (state: ChatState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.currentState));
  }
}

// Global instance for simple app-wide state (can be scoped per chat session via React Context later)
export const chatStateMachine = new ChatStateMachine();
