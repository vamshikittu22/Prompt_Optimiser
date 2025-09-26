import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface PromptHistory {
  id: number;
  idea: string;
  specifications: string;
  model: string;
  provider: string;
  createdAt: string;
}

export function History() {
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = localStorage.getItem('promptHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleUsePrompt = (promptData: PromptHistory) => {
    navigate('/', { state: { promptData } });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your prompt history? This cannot be undone.')) {
      localStorage.removeItem('promptHistory');
      setHistory([]);
    }
  };

  if (history.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">No History Yet</h1>
          <p className="text-muted-foreground mb-6">Your generated prompts will appear here.</p>
          <Button onClick={() => navigate('/')}>Generate Your First Prompt</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Prompt History</h1>
          <Button variant="outline" onClick={handleClearHistory}>
            Clear History
          </Button>
        </div>

        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{item.idea}</CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')} • {item.model}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUsePrompt(item)}
                    >
                      Use Again
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {item.specifications && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.specifications}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
