import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PromptData {
  id: number;
  idea: string;
  specifications: string;
  model: string;
  provider: string;
  createdAt: string;
}

export function Generate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState({
    role: '',
    task: '',
    context: '',
    style: '',
    constraints: '',
    tone: '',
    audience: '',
    format: '',
    examples: '',
  });

  useEffect(() => {
    if (location.state?.promptData) {
      setPromptData(location.state.promptData);
      generateOptimizedPrompt(location.state.promptData);
    } else {
      // If no prompt data is provided, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  const generateOptimizedPrompt = async (data: PromptData) => {
    setIsGenerating(true);
    
    try {
      // In a real app, you would call your API here
      // const response = await generatePromptWithAI(data);
      // setOptimizedPrompt(response.prompt);
      // setBreakdown(response.breakdown);
      
      // Mock response for demo purposes
      setTimeout(() => {
        const mockPrompt = `# ${data.idea}\n\n## Role\nYou are an expert ${data.model} prompt engineer. Your task is to help create highly effective prompts.\n\n## Task\n${data.idea}\n\n## Context\n${data.specifications || 'No additional context provided.'}\n\n## Style\n- Clear and concise\n- Professional yet approachable\n- Structured with clear sections\n\n## Constraints\n- Be specific and detailed\n- Include examples where helpful\n- Consider potential edge cases\n\n## Tone\nProfessional, helpful, and engaging.`;
        
        setOptimizedPrompt(mockPrompt);
        setBreakdown({
          role: 'Expert prompt engineer',
          task: data.idea,
          context: data.specifications || 'No additional context provided.',
          style: 'Clear, concise, professional yet approachable, structured with clear sections',
          constraints: 'Be specific and detailed, include examples where helpful, consider potential edge cases',
          tone: 'Professional, helpful, and engaging',
          audience: 'General audience',
          format: 'Markdown with clear section headers',
          examples: 'Included where relevant to illustrate concepts',
        });
        setIsLoading(false);
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate prompt. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Prompt copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!promptData) return;
    
    setIsSaving(true);
    
    try {
      // In a real app, you would save to a database here
      // For now, we'll just update local storage
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
      const updatedHistory = history.map((item: any) => 
        item.id === promptData.id 
          ? { ...item, optimizedPrompt, breakdown, updatedAt: new Date().toISOString() }
          : item
      );
      
      localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
      
      toast({
        title: 'Saved!',
        description: 'Prompt saved to your history.',
      });
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Generating your optimized prompt...</h2>
          <p className="text-muted-foreground mt-2">This may take a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to editor
        </Button>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Optimized Prompt</CardTitle>
                    <CardDescription>
                      Here's your optimized prompt for {promptData?.model}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopy}
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={optimizedPrompt}
                    onChange={(e) => setOptimizedPrompt(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    readOnly={!showBreakdown}
                  />
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-xs"
                    >
                      {showBreakdown ? 'Preview' : 'Edit'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Breakdown</CardTitle>
                <CardDescription>
                  Understand what makes this prompt effective
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Role</h4>
                  <p className="text-sm text-muted-foreground">{breakdown.role}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Task</h4>
                  <p className="text-sm text-muted-foreground">{breakdown.task}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Context</h4>
                  <p className="text-sm text-muted-foreground">{breakdown.context}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Style</h4>
                  <p className="text-sm text-muted-foreground">{breakdown.style}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Constraints</h4>
                  <p className="text-sm text-muted-foreground">{breakdown.constraints}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Tone</h4>
                  <p className="text-sm text-muted-foreground">{breakdown.tone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
                <CardDescription>
                  How to use this prompt effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  </div>
                  <p className="text-muted-foreground">
                    Copy and paste this prompt directly into {promptData?.provider === 'openai' ? 'ChatGPT' : 'your AI model of choice'}.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  </div>
                  <p className="text-muted-foreground">
                    For best results, provide as much context as possible in the specifications.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  </div>
                  <p className="text-muted-foreground">
                    Feel free to modify the prompt to better suit your specific needs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
