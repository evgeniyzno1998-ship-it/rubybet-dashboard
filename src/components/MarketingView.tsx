import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Loader2, Download, Sparkles } from 'lucide-react';

export function MarketingView() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if API key is selected (for Veo/Imagen/Pro Image models)
    // @ts-ignore
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      // @ts-ignore
      window.aistudio.hasSelectedApiKey().then(setHasApiKey);
    } else {
      // Fallback if not in AI Studio environment or if it's already injected
      setHasApiKey(!!process.env.GEMINI_API_KEY);
    }
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Create new instance to ensure latest API key is used
      // @ts-ignore
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please select an API key.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          // @ts-ignore
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: size
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setGeneratedImage(`data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        throw new Error("No image was returned by the model.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate image.");
      if (err.message && err.message.includes("Requested entity was not found")) {
         setHasApiKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-soft-white">Marketing Assets</h2>
          <p className="text-zinc-400 text-sm mt-1">Generate high-quality promotional images for your casino campaigns.</p>
        </div>
        {!hasApiKey && (
          <button 
            onClick={handleSelectKey}
            className="px-4 py-2 bg-ruby hover:bg-ruby-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            Connect Paid API Key
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-charcoal-light border border-charcoal-lighter rounded-xl p-6">
            <h3 className="text-lg font-medium text-soft-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ruby" />
              Generator Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., A luxurious casino interior with golden slot machines, neon lights, cinematic lighting, 8k resolution..."
                  className="w-full h-32 bg-charcoal border border-charcoal-lighter rounded-lg p-3 text-soft-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-ruby/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Image Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                        size === s 
                          ? 'bg-ruby/20 border-ruby text-ruby' 
                          : 'bg-charcoal border-charcoal-lighter text-zinc-400 hover:bg-charcoal-lighter'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1:1', '16:9', '9:16'] as const).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                        aspectRatio === ar 
                          ? 'bg-ruby/20 border-ruby text-ruby' 
                          : 'bg-charcoal border-charcoal-lighter text-zinc-400 hover:bg-charcoal-lighter'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || !hasApiKey}
                className="w-full py-3 bg-ruby hover:bg-ruby-hover disabled:bg-charcoal-lighter disabled:text-zinc-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>
              
              {!hasApiKey && (
                <p className="text-xs text-rose-400 text-center mt-2">
                  A paid API key is required to use the high-quality image model.
                </p>
              )}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm mt-4">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-charcoal-light border border-charcoal-lighter rounded-xl p-6 h-full min-h-[500px] flex flex-col">
            <h3 className="text-lg font-medium text-soft-white mb-4">Preview</h3>
            <div className="flex-1 bg-charcoal border border-charcoal-lighter rounded-lg flex items-center justify-center overflow-hidden relative">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin text-ruby" />
                  <p>Generating your {size} masterpiece...</p>
                </div>
              ) : generatedImage ? (
                <>
                  <img 
                    src={generatedImage} 
                    alt="Generated marketing asset" 
                    className="w-full h-full object-contain"
                  />
                  <a 
                    href={generatedImage} 
                    download={`casino-promo-${Date.now()}.png`}
                    className="absolute bottom-4 right-4 p-3 bg-charcoal-light/80 hover:bg-charcoal-light text-white rounded-full backdrop-blur-sm border border-charcoal-lighter transition-colors shadow-lg"
                    title="Download Image"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-600">
                  <ImageIcon className="w-12 h-12 opacity-50" />
                  <p>Your generated image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
