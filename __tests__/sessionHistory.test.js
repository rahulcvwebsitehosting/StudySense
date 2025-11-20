
import { saveSession, getStoredSessions } from '../services/storage';

// Mock LocalStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Dispatch Event
window.dispatchEvent = jest.fn();

describe('Session History Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    window.dispatchEvent.mockClear();
  });

  test('saveSession should append session to storage', () => {
    const session = { id: '123', focusTime: 60 };
    saveSession(session);
    
    const stored = getStoredSessions();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('123');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('saveSession should emit update event', () => {
    const session = { id: '456', focusTime: 120 };
    saveSession(session);
    
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    expect(window.dispatchEvent.mock.calls[0][0].type).toBe('studysense:session-updated');
  });
});
