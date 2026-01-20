"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Image as ImageIcon, Check, X, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createProposal, updateProposal } from "@/actions/proposal-actions";
import { searchUnsplashImages } from "@/actions/unsplash-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Proposal } from "@/types/dashboard";


export function PostProposalModal({
  triggerClassName,
  buttonText = "Post a Proposal",
  userSkills = [],
  proposal, // If provided, we are in EDIT mode
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  onClick
}: {
  triggerClassName?: string,
  buttonText?: string,
  userSkills?: any[],
  proposal?: Proposal,
  isOpen?: boolean,
  onOpenChange?: (open: boolean) => void,
  onClick?: () => void
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState<"Remote" | "In-Person">("Remote");
  const [offeredSkills, setOfferedSkills] = useState<string[]>([]);
  const [manualOfferedSkill, setManualOfferedSkill] = useState("");
  const [neededSkills, setNeededSkills] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Constants
  const MIN_TITLE = 5;
  const MAX_TITLE = 100;
  const MIN_DESC = 10;

  // Initialize form if editing
  React.useEffect(() => {
    if (isOpen && proposal) {
      setTitle(proposal.title);
      setDescription(proposal.description);
      setModality(proposal.modality === 'REMOTE' ? 'Remote' : 'In-Person');

      const offered = Array.isArray(proposal.offeredSkills) ? proposal.offeredSkills : [proposal.offeredSkills];
      setOfferedSkills(offered.map((s: any) => s.name || s.skill?.name).filter(Boolean));

      const needed = Array.isArray(proposal.neededSkills) ? proposal.neededSkills : [proposal.neededSkills];
      setNeededSkills(needed.map((s: any) => s.name || s.skill?.name).filter(Boolean).join(', '));

      setImageUrl(proposal.imageUrl || "");
    } else if (isOpen && !proposal) {
      setErrors({}); // Clear errors when opening fresh
    }
  }, [isOpen, proposal]);

  // Image Browser State
  const [isImageBrowserOpen, setImageBrowserOpen] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; url: string; alt?: string; user: { name: string } }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleImageSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = imageSearchQuery || offeredSkills[0] || title || "education";
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchUnsplashImages(query);
      setSearchResults(results);
      if (results.length === 0) {
        toast({ title: "No images found", description: "Try a different search term." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not search for images." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
    setImageBrowserOpen(false);
    setImageSearchQuery(""); // Clear search query after selection
    setSearchResults([]); // Clear search results after selection
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setOfferedSkills([]);
    setManualOfferedSkill("");
    setNeededSkills("");
    setImageUrl("");
    setImageSearchQuery("");
    setSearchResults([]);
    setImageBrowserOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-add any pending manual skill on submit
    let currentOffered = [...offeredSkills];
    if (manualOfferedSkill.trim() && !currentOffered.includes(manualOfferedSkill.trim())) {
      currentOffered.push(manualOfferedSkill.trim());
      setOfferedSkills(currentOffered);
      setManualOfferedSkill("");
    }

    // High-Fidelity Validation
    const newErrors: Record<string, string> = {};
    if (title.length < MIN_TITLE) newErrors.title = `Title must be at least ${MIN_TITLE} characters.`;
    if (description.length < MIN_DESC) newErrors.description = `Description must be at least ${MIN_DESC} characters.`;
    if (currentOffered.length === 0) newErrors.offered = "Add at least one skill you teach.";
    if (!neededSkills.trim()) newErrors.needed = "Specify skills you seek.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ variant: "destructive", title: "Refinement Required", description: "Please check the highlighted sectors." });
      return;
    }

    setIsLoading(true);

    const dataToSend = {
      title,
      description,
      modality,
      offeredSkillNames: offeredSkills.join(','),
      neededSkillNames: neededSkills,
      imageUrl,
    };

    try {
      let result;
      if (proposal) {
        result = await updateProposal(proposal.id, dataToSend);
      } else {
        result = await createProposal(dataToSend);
      }

      if (result.success) {
        toast({ variant: "success", title: "Success!", description: result.message });
        setIsOpen(false);
        clearForm();
        router.refresh();
      } else {
        const errorMsg = result.errors ? Object.values(result.errors).flat().join(' ') : result.message;
        toast({ variant: "destructive", title: "Error", description: errorMsg || "Failed to post proposal." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const addOfferedSkill = (skill: string) => {
    if (skill && !offeredSkills.includes(skill)) {
      setOfferedSkills([...offeredSkills, skill]);
      setManualOfferedSkill("");
    }
  };

  const removeOfferedSkill = (skill: string) => {
    setOfferedSkills(offeredSkills.filter(s => s !== skill));
  };

  // Render the Image Browser UI
  const renderImageBrowser = () => (
    <div className="bg-gradient-to-br from-primary/25 via-background to-background p-10 py-12 rounded-[2.5rem]">
      <DialogHeader className="mb-8">
        <DialogTitle className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Select Photo</DialogTitle>
        <DialogDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2 opacity-70">
          Find a high-quality cover for your proposal.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleImageSearch} className="flex gap-3 mb-6">
        <Input
          value={imageSearchQuery}
          onChange={(e) => setImageSearchQuery(e.target.value)}
          placeholder="Search Unsplash..."
          className="h-12 rounded-xl border-2 border-border focus:border-primary font-bold px-4"
        />
        <Button type="submit" size="icon" disabled={isSearching} className="h-12 w-12 rounded-xl bg-primary">
          {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </Button>
      </form>

      <div className="min-h-[300px] border-2 border-dashed border-border rounded-3xl p-4 mt-2 bg-muted/20 relative overflow-hidden">
        {isSearching && (
          <div className="absolute inset-0 flex justify-center items-center bg-background/40 backdrop-blur-sm z-10 rounded-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (
          <div className="flex flex-col justify-center items-center h-full min-h-[260px] text-sm text-muted-foreground opacity-50">
            <ImageIcon className="w-12 h-12 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs text-center">Enter a keyword above to<br />browse premium cover photos</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {searchResults.map(img => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleImageSelect(img.url)}
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 group",
                  imageUrl === img.url ? 'border-primary ring-4 ring-primary/20' : 'border-transparent'
                )}
              >
                <img src={img.url} alt={img.alt || "SkillTrade Cover"} className="w-full h-full object-cover" />
                {imageUrl === img.url && (
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                    <Check className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] font-black text-white truncate text-left uppercase tracking-tighter">Photo by {img.user.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button type="button" variant="ghost" onClick={() => setImageBrowserOpen(false)} className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] w-full border border-border">
          Back to Proposal Form
        </Button>
      </DialogFooter>
    </div>
  );

  // Render the Main Proposal Form UI
  const renderProposalForm = () => (
    <div className="bg-gradient-to-br from-primary/25 via-background to-background p-10 py-12 rounded-[2.5rem]">
      <DialogHeader className="mb-10">
        <DialogTitle className="text-4xl font-black text-foreground tracking-tighter uppercase italic">{proposal ? "Refine Sync" : "Launch Initiative"}</DialogTitle>
        <DialogDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2 opacity-70">
          {proposal ? "Adjust the parameters of your existing exchange." : "Formalize your expertise and the learning objectives you wish to pursue."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-primary">Sync Objective</Label>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter transition-colors",
              title.length >= MIN_TITLE && title.length < MAX_TITLE ? "text-emerald-500" :
                title.length >= MAX_TITLE ? "text-destructive animate-pulse" :
                  "text-muted-foreground/40"
            )}>
              {title.length}/{MAX_TITLE} {title.length >= MAX_TITLE ? "MAX REACHED" : title.length >= MIN_TITLE ? "✓" : `(min ${MIN_TITLE})`}
            </span>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
            }}
            aria-label="Sync Objective Title"
            maxLength={MAX_TITLE}
            placeholder="e.g., Master Classical Piano"
            className={cn(
              "h-12 rounded-xl border-2 font-bold px-4 transition-all duration-300",
              errors.title || title.length >= MAX_TITLE ? "border-destructive/50 bg-destructive/5" : title.length >= MIN_TITLE ? "border-emerald-500/20 focus:border-emerald-500" : "border-border"
            )}
            required
          />
          {errors.title && <p className="text-[9px] font-black uppercase text-destructive ml-1 animate-in fade-in slide-in-from-left-2">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-primary">Description</Label>
            <span className={cn("text-[8px] font-black uppercase tracking-tighter transition-colors", description.length >= MIN_DESC ? "text-emerald-500" : "text-muted-foreground/40")}>
              {description.length} chars {description.length >= MIN_DESC ? "✓" : `(min ${MIN_DESC})`}
            </span>
          </div>
          <Textarea
            id="description"
            aria-label="Detailed Sync Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
            }}
            placeholder="Describe what you're offering and what you'd like in return..."
            className={cn(
              "min-h-[100px] rounded-xl border-2 font-medium p-4 transition-all duration-300",
              errors.description ? "border-destructive/50 bg-destructive/5" : description.length >= MIN_DESC ? "border-emerald-500/20 focus:border-emerald-500" : "border-border"
            )}
            required
          />
          {errors.description && <p className="text-[9px] font-black uppercase text-destructive ml-1 animate-in fade-in slide-in-from-left-2">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Cover Image (Optional)</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-border group relative">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Selected Cover" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl('')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <X className="w-6 h-6 text-white" />
                  </button>
                </>
              ) : (
                <ImageIcon className="text-muted-foreground opacity-30 w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <Button type="button" variant="outline" className="h-12 w-full rounded-xl border-2 border-border font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 hover:text-primary transition-all" onClick={() => setImageBrowserOpen(true)}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {imageUrl ? "Change Photo" : "Add Cover Photo"}
              </Button>
              <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest text-center opacity-60">Search from millions of photos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Modality</Label>
            <Select value={modality} onValueChange={(val: "Remote" | "In-Person") => setModality(val)}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-border font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-border">
                <SelectItem value="Remote" className="font-bold">Remote</SelectItem>
                <SelectItem value="In-Person" className="font-bold">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Skills You Teach</Label>
              {offeredSkills.length > 0 && <span className="text-[8px] font-black uppercase text-emerald-500 tracking-tighter">{offeredSkills.length} Added ✓</span>}
            </div>

            {/* Selected Skills Badges */}
            <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 rounded-xl bg-emerald-500/5 border border-dashed border-emerald-500/20">
              {offeredSkills.length === 0 ? (
                <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest m-auto">No skills added yet</span>
              ) : (
                offeredSkills.map(skill => (
                  <div key={skill} className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/10 animate-in zoom-in duration-300">
                    {skill}
                    <button type="button" onClick={() => removeOfferedSkill(skill)} className="hover:text-emerald-100 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={manualOfferedSkill}
                  onChange={(e) => {
                    setManualOfferedSkill(e.target.value);
                    if (errors.offered) setErrors(prev => ({ ...prev, offered: "" }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addOfferedSkill(manualOfferedSkill.trim());
                      if (errors.offered) setErrors(prev => ({ ...prev, offered: "" }));
                    }
                  }}
                  onBlur={() => {
                    // Auto-add on blur if there's text
                    if (manualOfferedSkill.trim()) {
                      addOfferedSkill(manualOfferedSkill.trim());
                      if (errors.offered) setErrors(prev => ({ ...prev, offered: "" }));
                    }
                  }}
                  placeholder="Type a skill and press Enter (or comma)..."
                  className={cn(
                    "h-12 rounded-xl border-2 font-bold px-4 transition-all duration-300",
                    errors.offered ? "border-destructive/50 bg-destructive/5" : offeredSkills.length > 0 ? "border-emerald-500/20 focus:border-emerald-500" : "border-border"
                  )}
                />
              </div>
              {userSkills && userSkills.length > 0 && (
                <div className="relative z-[100]">
                  <Select onValueChange={(val) => {
                    addOfferedSkill(val);
                    if (errors.offered) setErrors(prev => ({ ...prev, offered: "" }));
                  }}>
                    <SelectTrigger className="h-12 w-12 p-0 flex items-center justify-center border-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded-xl hover:bg-emerald-500/10 transition-all">
                      <Plus className="w-5 h-5" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl border-2 border-border z-[1000]">
                      {userSkills.map((s) => {
                        const skillName = (s as any).skill?.name || s.name;
                        const skillId = (s as any).skill?.id || s.id;
                        return (
                          <SelectItem key={skillId} value={skillName} className="font-bold">
                            {skillName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {errors.offered && <p className="text-[9px] font-black uppercase text-destructive ml-1 animate-in fade-in slide-in-from-left-2">{errors.offered}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="needed" className="text-[10px] font-black uppercase tracking-widest text-orange-500 ml-1">Skills You Seek (comma separated)</Label>
          <Input
            id="needed"
            value={neededSkills}
            onChange={(e) => {
              setNeededSkills(e.target.value);
              if (errors.needed) setErrors(prev => ({ ...prev, needed: "" }));
            }}
            placeholder="e.g. Cooking, French"
            className={cn(
              "h-12 rounded-xl border-2 font-bold px-4 transition-all duration-300",
              errors.needed ? "border-destructive/50 bg-destructive/5" : neededSkills.length > 3 ? "border-orange-500/20 focus:border-orange-500" : "border-border"
            )}
            required
          />
          {errors.needed && <p className="text-[9px] font-black uppercase text-destructive ml-1 animate-in fade-in slide-in-from-left-2">{errors.needed}</p>}
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 rounded-2xl text-xl font-black bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary shadow-xl shadow-primary/10 hover:scale-[1.05] active:scale-95 transition-all gap-3 haptic-touch relative overflow-hidden group hover:bg-primary/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            {proposal ? "Save Changes" : "Publish Proposal"}
          </Button>
        </DialogFooter>
      </form>
    </div >
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {(!externalIsOpen && !externalOnOpenChange) && (
          <Button
            className={cn(
              "flex items-center gap-2 bg-primary/20 backdrop-blur-xl hover:bg-primary/30 text-primary font-extrabold py-3 sm:py-6 px-3 sm:px-8 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm border border-primary/30",
              triggerClassName
            )}
            onClick={onClick}
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" /> <span className="hidden sm:inline">{buttonText}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-background max-h-[90vh] overflow-y-auto custom-scrollbar">
        {isImageBrowserOpen ? renderImageBrowser() : renderProposalForm()}
      </DialogContent>
    </Dialog>
  );
}
