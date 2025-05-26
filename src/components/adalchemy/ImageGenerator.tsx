
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateBannerImages, type GenerateBannerImagesInput } from '@/ai/flows/generate-banner-images';
import { improveUserPrompt, type ImproveUserPromptInput } from '@/ai/flows/improve-user-prompt';
import { ImageCard } from './ImageCard';
import { LoadingSpinner } from './LoadingSpinner';
import { Lightbulb, Wand2, Stars, Info, DownloadCloud } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters long." }).max(500, { message: "Prompt cannot exceed 500 characters." }),
});

type FormData = z.infer<typeof formSchema>;

const initialImagePlaceholders = Array(4).fill(null);

export function ImageGenerator() {
  const [generatedImages, setGeneratedImages] = useState<(string | null)[]>(initialImagePlaceholders);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const saveGenerationToFirebase = async (prompt: string, imageDataUris: string[]) => {
    if (!currentUser || !currentUser.email) { 
      toast({ title: "Authentication Error", description: "User not logged in or email not available. Cannot save history.", variant: "destructive" });
      return;
    }
    // This console log will show the UID and Email being used for saving
    console.log("Attempting to save to Firebase for user UID:", currentUser.uid, "Email:", currentUser.email); 
    setIsSavingHistory(true);
    try {
      const uploadedImageUrls: string[] = [];
      const timestamp = Date.now();

      for (let i = 0; i < imageDataUris.length; i++) {
        const imagePath = `user_generations/${currentUser.uid}/${timestamp}/banner_${i}.png`;
        const imageFileRef = storageRef(storage, imagePath);
        if (typeof imageDataUris[i] === 'string' && imageDataUris[i].startsWith('data:')) {
          await uploadString(imageFileRef, imageDataUris[i], 'data_url');
          const downloadUrl = await getDownloadURL(imageFileRef);
          uploadedImageUrls.push(downloadUrl);
        } else {
          console.warn(`Skipping invalid image data URI for banner ${i}:`, imageDataUris[i]);
        }
      }

      if (uploadedImageUrls.length === 0 && imageDataUris.length > 0) {
         throw new Error("Failed to upload any images to storage.");
      }
      
      await addDoc(collection(db, "generationHistory"), {
        userId: currentUser.uid,
        userEmail: currentUser.email, // This line saves the user's email
        prompt: prompt,
        imageUrls: uploadedImageUrls,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Generation Saved",
        description: "Your prompt and images have been saved to your history.",
        variant: "default",
      });
      window.dispatchEvent(new CustomEvent('adalchemyHistoryUpdated'));

    } catch (error) {
      console.error("Error saving generation to Firebase:", error);
      toast({
        title: "Could not save to history",
        description: (error as Error).message || "There was an issue saving this generation to Firebase.",
        variant: "destructive",
      });
    } finally {
      setIsSavingHistory(false);
    }
  };


  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Required", description: "Please log in to generate images.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setGeneratedImages(Array(4).fill(null)); 
    try {
      const input: GenerateBannerImagesInput = { prompt: data.prompt };
      const result = await generateBannerImages(input);
      if (result.bannerImages && result.bannerImages.length > 0) {
        setGeneratedImages(result.bannerImages);
        const validImageUris = result.bannerImages.filter(uri => typeof uri === 'string' && uri.startsWith('data:')) as string[];
        if (validImageUris.length > 0) {
            await saveGenerationToFirebase(data.prompt, validImageUris);
        } else if (result.bannerImages.length > 0) {
            console.warn("Images were generated but none were valid data URIs to save to history.");
            toast({
                title: "Images Generated (Not Saved)",
                description: "Images were generated but could not be saved to history due to invalid format. Please download them manually.",
                variant: "default"
            });
        }
      } else {
        setGeneratedImages(initialImagePlaceholders); 
        throw new Error("AI did not return any images.");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      toast({
        title: "Error Generating Images",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setGeneratedImages(initialImagePlaceholders); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!currentUser) {
      toast({ title: "Authentication Required", description: "Please log in to enhance prompts.", variant: "destructive" });
      return;
    }
    const currentPrompt = form.getValues('prompt');
    if (!currentPrompt || currentPrompt.length < 10) {
      toast({
        title: "Prompt too short",
        description: "Please enter a prompt of at least 10 characters to enhance.",
        variant: "default",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const input: ImproveUserPromptInput = { userPrompt: currentPrompt };
      const result = await improveUserPrompt(input);
      if (result.improvedPrompt) {
        form.setValue('prompt', result.improvedPrompt, { shouldValidate: true });
        toast({
          title: "Prompt Enhanced!",
          description: "Your prompt has been improved by AI.",
          variant: "default",
        });
      } else {
        throw new Error("AI did not return an improved prompt.");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast({
        title: "Error Enhancing Prompt",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };


  return (
    <div className="space-y-8 py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Wand2 className="h-8 w-8 text-primary" />
            Create Your Banner Ad
          </CardTitle>
          <CardDescription className="text-md">
            Enter a detailed prompt and let AdAlchemy craft unique banner images for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-6 bg-accent/10 border-accent/30">
            <DownloadCloud className="h-5 w-5 text-accent" />
            <AlertTitle className="text-accent font-semibold">Images Saved to History!</AlertTitle>
            <AlertDescription className="text-accent/80">
              Generated banners are saved to your history. You can also download them using the buttons below each image.
            </AlertDescription>
          </Alert>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel htmlFor="prompt" className="text-lg">Your Ad Prompt</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleEnhancePrompt}
                        disabled={isLoading || isEnhancing || isSavingHistory || !form.watch('prompt') || form.watch('prompt').length < 10 || !currentUser}
                        className="border-accent text-accent hover:bg-accent/10 hover:text-accent"
                      >
                        {isEnhancing ? (
                          <>
                            <LoadingSpinner size={16} className="mr-2" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Stars className="mr-2 h-4 w-4" />
                            Enhance Prompt
                          </>
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        id="prompt"
                        placeholder="e.g., 'A vibrant banner for a summer sale on eco-friendly sneakers, featuring lush green leaves and bright sunshine.'"
                        className="min-h-[100px] text-base border-input-border focus:ring-ring focus:border-primary"
                        {...field}
                        disabled={isLoading || isEnhancing || isSavingHistory || !currentUser}
                      />
                    </FormControl>
                     {!currentUser && <p className="text-sm text-destructive mt-1">Please log in to use the generator.</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isLoading || isEnhancing || isSavingHistory || !currentUser}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size={20} className="mr-2" />
                    Generating...
                  </>
                ) : isSavingHistory ? (
                   <>
                    <LoadingSpinner size={20} className="mr-2" />
                    Saving History...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Generate Banners
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      { (isLoading || generatedImages.some(img => img !== null)) && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">Your Generated Banners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {generatedImages.map((src, index) => (
              <ImageCard key={index} imageUrl={src} index={index} isLoading={isLoading && src === null} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

    