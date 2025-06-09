import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// ポリフィル
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// localStorage モック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock as any;

// crypto モック
global.crypto = {
  getRandomValues: (arr: any) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {} as any
} as any;

// console.error を抑制（React の警告など）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// 各テスト後にモックをリセット
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});