import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../src/app/api/health/gemini/route';
import { GET as HealthDB } from '../../../src/app/api/health/database/route';

// Mock the dependencies
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockResolvedValue({
            response: { text: () => "mock ping response" }
          })
        })
      };
    })
  };
});

describe('Health API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/health/gemini returns 200 on success', async () => {
    process.env.GEMINI_API_KEY = "test_key";
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.api_key_configured).toBe(true);
  });
  
  it('GET /api/health/gemini returns 500 if no key', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe("Missing API Key");
  });
});
