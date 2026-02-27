import { useState } from 'react';

interface ClassificationResult {
  waste_type: string;
  category_id: number;
  confidence: number;
  recommendations: string[];
}

interface UseAIClassificationReturn {
  classifying: boolean;
  error: string | null;
  result: ClassificationResult | null;
  classifyImage: (file: File) => Promise<ClassificationResult | null>;
  reset: () => void;
}

export function useAIClassification(apiUrl: string = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000'): UseAIClassificationReturn {
  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const classifyImage = async (file: File): Promise<ClassificationResult | null> => {
    setClassifying(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiUrl}/classify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to classify image');
      }

      const data: ClassificationResult = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setClassifying(false);
    }
  };

  const reset = () => {
    setClassifying(false);
    setError(null);
    setResult(null);
  };

  return {
    classifying,
    error,
    result,
    classifyImage,
    reset,
  };
}
