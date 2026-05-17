import { useState, useEffect } from "react";
import { useListPersonas, useGenerateActionCards, useComparePersonas } from "@workspace/api-client-react";
import {
  AlertTriangle, ShieldCheck, Activity, Smartphone, Info, RefreshCw, CheckCircle2,
  XCircle, Battery, MessageSquare, Megaphone, CheckSquare, BrainCircuit, Code,
  Users, KeyRound, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActionCardResult, PersonaCardPair } from "@workspace/api-client-react/src/generated/api.schemas";

type ResultWithWarning = (ActionCardResult | PersonaCardPair) & { warning?: string };

const DEFAULT_ALERT = "Official Flood Warning: Heavy rainfall and urban flooding expected in low-lying areas. Avoid travel through waterlogged roads. Follow local authorities.";

const PERSONA_STATUS: Record<string, { label: string; className: string }> = {
  asha:  { label: "High Risk",            className: "bg-red-100 text-red-800 border-red-300" },
  imran: { label: "Assistance Required",  className: "bg-orange-100 text-orange-800 border-orange-300" },
  meena: { label: "Prepare & Monitor",    className: "bg-amber-100 text-amber-800 border-amber-300" },
};

export default function Home() {
  const [alertText, setAlertText] = useState(DEFAULT_ALERT);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const { data: personas, isLoading: personasLoading } = useListPersonas();
  const generateCards = useGenerateActionCards();
  const comparePersonas = useComparePersonas();

  const trimmedKey = apiKey.trim() || undefined;

  useEffect(() => {
    if (personas && personas.length > 0 && !comparePersonas.data && !comparePersonas.isPending) {
      comparePersonas.mutate({ data: { alertText, ...(trimmedKey ? { apiKey: trimmedKey } : {}) } });
    }
  }, [personas]);

  const handleGenerate = () => {
    if (!selectedPersonaId) return;
    generateCards.mutate({
      data: { alertText, personaId: selectedPersonaId, ...(trimmedKey ? { apiKey: trimmedKey } : {}) }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
            Last-Mile Guardian
          </div>
          <Badge variant="outline" className="text-xs font-mono bg-amber-50 text-amber-700 border-amber-300">
            Gemma 4 Good Hackathon
          </Badge>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section — compact */}
        <section className="py-10 md:py-14 px-4 container mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-transparent">
            Alert-to-Action Translation System
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Calm clarity in a storm.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Official alerts tell everyone the danger.{" "}
            <strong className="text-foreground">Last-Mile Guardian tells each person their next safe action.</strong>
          </p>
        </section>

        {/* Input & Persona Section */}
        <section className="py-8 px-4 bg-muted/50 border-y">
          <div className="container mx-auto max-w-5xl space-y-8">

            {/* Alert Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h2>Official Alert Source</h2>
              </div>
              <Card className="border-border shadow-sm">
                <CardContent className="p-4">
                  <Label htmlFor="alertText" className="sr-only">Alert Text</Label>
                  <Textarea
                    id="alertText"
                    data-testid="input-alert-text"
                    value={alertText}
                    onChange={(e) => setAlertText(e.target.value)}
                    className="min-h-[80px] text-base resize-y bg-background font-medium focus-visible:ring-primary"
                    placeholder="Paste official alert text here..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Optional Gemma API Key */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="toggle-api-key"
              >
                <KeyRound className="h-4 w-4" />
                <span>Optional: Use live Gemma API key</span>
                {showApiKey ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {showApiKey && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="apiKey" className="text-sm font-medium">
                        GOOGLE_API_KEY or GEMMA_API_KEY
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        data-testid="input-api-key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your API key here (used only in memory, never stored)"
                        className="font-mono text-sm"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Without a key, the app uses high-quality demo outputs.
                      With a key, Gemma generates live responses. The key is never logged, stored, or displayed.
                      You can also set <code className="bg-muted px-1 rounded">GOOGLE_API_KEY</code> in Replit Secrets for persistent live mode.
                    </p>
                    {trimmedKey && (
                      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                        API key set — next generation will use Live Gemma Mode
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Persona Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                <Activity className="h-4 w-4 text-primary" />
                <h2>Select Vulnerability Profile</h2>
              </div>

              {personasLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-[180px] rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {personas?.map(persona => (
                    <Card
                      key={persona.id}
                      data-testid={`card-persona-${persona.id}`}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 ${selectedPersonaId === persona.id ? 'ring-2 ring-primary border-primary shadow-md bg-primary/5' : 'bg-card'}`}
                      onClick={() => setSelectedPersonaId(persona.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg">{persona.name}, {persona.age}</CardTitle>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {PERSONA_STATUS[persona.id] && (
                              <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 ${PERSONA_STATUS[persona.id].className}`}>
                                {PERSONA_STATUS[persona.id].label}
                              </Badge>
                            )}
                            {selectedPersonaId === persona.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm">{persona.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-foreground min-w-[80px]">Floor:</span>
                            <span>{persona.floor}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-foreground min-w-[80px]">Conditions:</span>
                            <span>{persona.conditions.join(", ")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-foreground min-w-[80px]">Evacuate:</span>
                            <span>{persona.canEvacuateAlone ? "Independent" : "Needs Assistance"}</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                data-testid="button-generate"
                className="w-full md:w-auto md:min-w-[300px] text-lg h-12 font-semibold shadow-md"
                onClick={handleGenerate}
                disabled={!selectedPersonaId || generateCards.isPending}
              >
                {generateCards.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Situation...
                  </>
                ) : (
                  "Generate Action Cards with Gemma 4"
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Generated Cards Section */}
        {generateCards.data && (
          <section className="py-10 px-4 container mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
              <h2 className="text-2xl font-bold text-foreground">
                Action Plan for {generateCards.data.persona.name}
              </h2>
              <ModeBadge mode={generateCards.data.mode} />
            </div>

            {(generateCards.data as ResultWithWarning).warning && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{(generateCards.data as ResultWithWarning).warning}</span>
              </div>
            )}

            <ActionCardsDisplay data={generateCards.data} />
          </section>
        )}

        {/* Compare Section — always visible */}
        <section className="py-12 px-4 bg-muted/30 border-y">
          <div className="container mx-auto max-w-6xl space-y-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Core Intelligence</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Same alert. Different lives. Different actions.
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                The same official warning produces radically different safe actions based on each person's vulnerability.
              </p>
            </div>

            {comparePersonas.isPending && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-[340px] rounded-xl" />
                ))}
              </div>
            )}

            {comparePersonas.data && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {comparePersonas.data.map((pair: PersonaCardPair) => (
                  <CompareCard key={pair.persona.id} pair={pair} />
                ))}
              </div>
            )}

            {!comparePersonas.isPending && !comparePersonas.data && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  data-testid="button-compare"
                  onClick={() => comparePersonas.mutate({ data: { alertText } })}
                  className="font-semibold"
                >
                  Load Comparison
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-12 px-4 container mx-auto max-w-5xl">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">How It Works</h2>
              <p className="text-muted-foreground">The translation pipeline from raw alert to personalized action.</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border shadow-sm overflow-x-auto">
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-sm min-w-[500px]">
                <PipelineBlock label="Official Alert" sublabel="Government warning text" color="amber" icon={<AlertTriangle className="h-4 w-4" />} />
                <PipelineArrow />
                <PipelineBlock label="Vulnerability Profile" sublabel="Age, mobility, conditions" color="blue" icon={<Activity className="h-4 w-4" />} />
                <PipelineArrow />
                <PipelineBlock label="Safety Rules" sublabel="No route claims, no rescue guarantees" color="red" icon={<ShieldCheck className="h-4 w-4" />} />
                <PipelineArrow />
                <PipelineBlock label="Gemma 4 Reasoning" sublabel="Structured AI response" color="primary" icon={<BrainCircuit className="h-4 w-4" />} highlighted />
                <PipelineArrow />
                <PipelineBlock label="Action Cards" sublabel="SMS / IVR / WhatsApp / Rescue / Checklist" color="green" icon={<CheckSquare className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="py-10 px-4 bg-red-50/60 border-t border-red-200/50">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-destructive">Safety Constraints</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive flex-shrink-0" /> Does not replace official authorities</li>
                    <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive flex-shrink-0" /> Does not predict floods</li>
                    <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive flex-shrink-0" /> Does not guarantee rescue</li>
                  </ul>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive flex-shrink-0" /> Does not claim routes are safe</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" /> Uses official alert text as source</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" /> Avoids rumors and misinformation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t space-y-1">
        <p className="font-medium">Built for the Gemma 4 Good Hackathon</p>
        <p className="text-xs">Demo mode active — set GOOGLE_API_KEY to enable real Gemma 4 responses</p>
      </footer>
    </div>
  );
}

function PipelineBlock({
  label, sublabel, icon, highlighted
}: {
  label: string; sublabel: string; color: string; icon: React.ReactNode; highlighted?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center text-center p-3 rounded-xl border min-w-[120px] ${highlighted ? "bg-primary/10 border-primary/30" : "bg-muted/50 border-border"}`}>
      <div className={`mb-2 ${highlighted ? "text-primary" : "text-muted-foreground"}`}>{icon}</div>
      <span className={`font-semibold text-xs ${highlighted ? "text-primary" : "text-foreground"}`}>{label}</span>
      <span className="text-xs text-muted-foreground mt-0.5">{sublabel}</span>
    </div>
  );
}

function PipelineArrow() {
  return <span className="text-muted-foreground text-lg font-light hidden md:block">→</span>;
}

function CompareCard({ pair }: { pair: PersonaCardPair }) {
  return (
    <Card className="border-border shadow-sm flex flex-col" data-testid={`card-compare-${pair.persona.id}`}>
      <CardHeader className="pb-3 border-b bg-muted/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{pair.persona.name}, {pair.persona.age}</CardTitle>
            <CardDescription className="text-xs mt-1">{pair.persona.floor} · {pair.persona.conditions.join(", ")}</CardDescription>
          </div>
          {!pair.persona.canEvacuateAlone && (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 flex-shrink-0">
              Needs Help
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">First Safe Action</Label>
          <div className="p-3 bg-primary/10 text-foreground rounded-lg font-semibold text-sm border border-primary/20 leading-snug">
            {pair.cards.first_action}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Why This Action</Label>
          <p className="text-xs text-foreground/80 leading-relaxed">{pair.cards.why_this_action}</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Hindi IVR (Sample)</Label>
          <div className="p-2 bg-muted rounded text-xs text-muted-foreground italic leading-relaxed font-mono">
            {pair.cards.ivr_script.slice(0, 120)}{pair.cards.ivr_script.length > 120 ? "..." : ""}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Must Take</Label>
          <ul className="space-y-1">
            {pair.cards.must_take.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCardsDisplay({ data }: { data: ActionCardResult }) {
  const cards = data.cards;
  const persona = data.persona;

  const jsonSubset = {
    first_action: cards.first_action,
    why_this_action: cards.why_this_action,
    must_take: cards.must_take,
    do_not_do: cards.do_not_do,
    sms_card: cards.sms_card,
    ivr_script: cards.ivr_script,
    volunteer_rescue_card: cards.volunteer_rescue_card,
    priority: !persona.canEvacuateAlone ? "HIGH — needs external assistance" : "STANDARD — can move independently",
    safety_notes: [cards.rumor_safety_note, cards.battery_saving_tip],
  };

  return (
    <div className="space-y-6">
      {/* First Safe Action — hero card */}
      <Card className="border-2 border-destructive shadow-lg bg-destructive/5 overflow-hidden">
        <div className="bg-destructive text-destructive-foreground px-6 py-2.5 font-bold flex items-center gap-2 tracking-wide uppercase text-sm">
          <AlertTriangle className="h-4 w-4" /> First Safe Action
        </div>
        <CardContent className="p-5 md:p-6 space-y-4">
          <h3 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
            {cards.first_action}
          </h3>
          <div className="p-4 bg-background rounded-lg border border-destructive/20 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Why This Action</p>
            <p className="text-sm font-medium text-foreground">{cards.why_this_action}</p>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <p>{cards.risk_summary}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next Steps */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-4 w-4 text-primary" /> Next 3 Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ol className="space-y-3">
              {cards.next_3_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center bg-primary/10 text-primary w-5 h-5 rounded-full font-bold text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Must Take & Do Not Do */}
        <div className="space-y-4">
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="py-3 px-4 bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Must Take
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-1.5">
                {cards.must_take.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-destructive/20">
            <CardHeader className="py-3 px-4 bg-destructive/5 border-b border-destructive/10">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" /> Do Not Do
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-1.5">
                {cards.do_not_do.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <div className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardContent className="p-4 flex gap-3">
            <Battery className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Battery Tip</h4>
              <p className="text-sm text-amber-800 mt-1">{cards.battery_saving_tip}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-4 flex gap-3">
            <Megaphone className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Rumor Safety</h4>
              <p className="text-sm text-blue-800 mt-1">{cards.rumor_safety_note}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> SMS Action Card
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 font-mono text-xs whitespace-pre-wrap bg-zinc-50 text-zinc-700 rounded-b-lg">
              {cards.sms_card}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" /> Hindi IVR Voice Script
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 text-sm italic text-muted-foreground whitespace-pre-wrap bg-blue-50/40 rounded-b-lg">
              "{cards.ivr_script}"
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp Family Card
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 text-sm whitespace-pre-wrap bg-green-50/50 rounded-b-lg">
              {cards.whatsapp_family_card}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/30">
          <CardHeader className="py-3 px-4 border-b bg-primary/10">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" /> Volunteer Rescue Handoff
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 text-sm font-medium whitespace-pre-wrap bg-primary/5 rounded-b-lg">
              {cards.volunteer_rescue_card}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offline Checklist */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 bg-muted/40 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckSquare className="h-4 w-4" /> Offline Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cards.offline_checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-muted/30 p-3 rounded border">
                <div className="h-4 w-4 rounded border-2 border-muted-foreground/40 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Collapsible: Gemma Reasoning */}
      <Accordion type="single" collapsible className="w-full bg-card border rounded-lg shadow-sm">
        <AccordionItem value="reasoning" className="border-b-0">
          <AccordionTrigger className="px-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 font-medium text-sm">
              <BrainCircuit className="h-4 w-4 text-primary" /> Gemma Reasoning Summary
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{cards.gemma_reasoning_summary}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Collapsible: Structured JSON */}
      <Accordion type="single" collapsible className="w-full bg-card border rounded-lg shadow-sm">
        <AccordionItem value="json" className="border-b-0">
          <AccordionTrigger className="px-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
              <Code className="h-4 w-4" /> Structured JSON Output
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <ScrollArea className="h-72 w-full bg-zinc-950 text-zinc-50 p-4 rounded-b-lg">
              <pre className="text-xs font-mono">
                {JSON.stringify(jsonSubset, null, 2)}
              </pre>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  if (mode === "gemma") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-mono px-3 py-1 bg-green-100 text-green-800 border-green-300">
          Live Gemma Mode: model-generated outputs
        </Badge>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant="outline" className="text-xs font-mono px-3 py-1 bg-amber-100 text-amber-800 border-amber-300">
        Demo Mode: deterministic sample outputs
      </Badge>
      <span className="text-xs text-muted-foreground">
        Set GOOGLE_API_KEY in Replit Secrets or enter a key above for live mode.
      </span>
    </div>
  );
}
