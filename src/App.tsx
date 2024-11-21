import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ApiResponse {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_lowercase_alphabet: string[];
  is_prime_found: boolean;
  file_valid?: boolean;
  file_mime_type?: string;
  file_size_kb?: string;
}

interface RequestData {
  data: string[];
  file_b64?: string;
}

function App() {
  const [inputJson, setInputJson] = useState<string>('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const parsedJson = JSON.parse(inputJson) as RequestData;
      
      if (!parsedJson.data || !Array.isArray(parsedJson.data)) {
        throw new Error('JSON must contain a "data" array');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bfhl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: inputJson,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as ApiResponse;
      setResponse(data);
      toast({
        title: "Success!",
        description: "Data processed successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof SyntaxError 
        ? 'Invalid JSON format. Please check your input.'
        : `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectedData = () => {
    if (!response) return null;

    return (
      <div className="grid gap-4">
        {selectedOptions.includes('alphabets') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alphabets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{response.alphabets.join(', ') || 'None'}</p>
            </CardContent>
          </Card>
        )}
        
        {selectedOptions.includes('numbers') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{response.numbers.join(', ') || 'None'}</p>
            </CardContent>
          </Card>
        )}
        
        {selectedOptions.includes('highest') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Highest Lowercase Alphabet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {response.highest_lowercase_alphabet.join(', ') || 'None'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>JSON Data Processor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={inputJson}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setInputJson(e.target.value)
                }
                placeholder='Enter JSON (e.g., {"data": ["A","C","z"]})'
                className="font-mono min-h-[150px]"
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Select Data to Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {['alphabets', 'numbers', 'highest'].map((option) => (
                  <Button
                    key={option}
                    variant={selectedOptions.includes(option) ? "default" : "outline"}
                    onClick={() => handleOptionToggle(option)}
                    className="capitalize"
                  >
                    {option === 'highest' ? 'Highest Lowercase' : option}
                  </Button>
                ))}
              </div>
              
              {renderSelectedData()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
