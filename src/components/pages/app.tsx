import Link from "next/link";
import { Palette, Sparkles, Moon, Layers, SunMoon, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

function WispColorPalette() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <div className="flex items-center gap-2">
        <Palette size={18} className="text-pale-cyan" />
        <h2 className="text-xl font-medium">Wisp Color Palette</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ColorSwatch name="Black" variable="--black" />
        <ColorSwatch name="Deep Charcoal" variable="--deep-charcoal" />
        <ColorSwatch name="Slate Grey" variable="--slate-grey" />
        <ColorSwatch name="Ash Grey" variable="--ash-grey" />
        <ColorSwatch name="Pale Cyan" variable="--pale-cyan" />
        <ColorSwatch name="Soft Lavender" variable="--soft-lavender" />
        <ColorSwatch name="Ghostly White" variable="--ghostly-white" />
        <ColorSwatch name="Soft White" variable="--soft-white" />
        <ColorSwatch name="Moonlight Silver" variable="--moonlight-silver" />
        <ColorSwatch name="Moonlight Silver Dim" variable="--moonlight-silver-dim" />
        <ColorSwatch name="Moonlight Silver Bright" variable="--moonlight-silver-bright" />
        <ColorSwatch name="Ethereal Teal" variable="--ethereal-teal" />
        <ColorSwatch name="Sky Glow" variable="--sky-glow" />
        <ColorSwatch name="Ice Glint" variable="--ice-glint" />
        <ColorSwatch name="Neon Purple" variable="--neon-purple" />
        <ColorSwatch name="Flare Cyan" variable="--flare-cyan" />
        <ColorSwatch name="Error Rose" variable="--error-rose" />
        <ColorSwatch name="Warning Amber" variable="--warning-amber" />
        <ColorSwatch name="Faint Rose" variable="--faint-rose" />
        <ColorSwatch name="Wisp Blue" variable="--wisp-blue" />
        <ColorSwatch name="Glow Ember" variable="--glow-ember" />
        <ColorSwatch name="Silver Mist" variable="--silver-mist" />
      </div>
    </div>
  );
}

function ColorSwatch({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-md shadow-sm mb-2"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <span className="text-xs text-center">{name}</span>
    </div>
  );
}


function WispUIExamples() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-ghostly-white" />
        <h2 className="text-xl font-medium">UI Components</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Moonlight Card</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              A wispy card with silver text for better contrast. Hover to see elevation effect.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button variant="default">
            Important Button
          </Button>
          <Button variant="secondary">
            Silver Button
          </Button>
          <Button variant="ghost">
            Ghost Button
          </Button>
        </div>
      </div>
    </div>
  );
}

function WispBorderExample() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-ethereal-teal" />
        <h2 className="text-xl font-medium">Wispy Effects</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="wispy-border">
          <CardHeader>
            <CardTitle className="wispy-text-glow">Silver Glow</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Moonlight Silver creates a subtle glow effect around this component's border.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-muted border-moonlight-silver/50">
          <CardHeader>
            <CardTitle className="wispy-gradient-text">Gradient Effect</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="silver-text">
              This is on our slate grey surface, even more distinct from the background.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MoonlightContrastExample() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <div className="flex items-center gap-2">
        <SunMoon size={18} className="text-ethereal-teal" />
        <h2 className="text-xl font-medium silver-text">Surfaces & Contrast</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card vs Background contrast */}
        <div className="p-6 rounded-lg bg-card">
          <h3 className="font-medium mb-4 text-moonlight-silver-bright">Card Element</h3>
          
          <div className="space-y-3">
            <p className="text-moonlight-silver-bright">
              Notice how this card uses a deep charcoal color, distinct from the pure black background.
            </p>
            
            <div className="mt-4 p-3 bg-black border border-moonlight-silver/30 rounded-md">
              <p className="text-moonlight-silver">
                This inner element uses the pure black background for nested contrast.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-slate-grey border border-moonlight-silver/30 rounded-md">
              <p className="text-moonlight-silver-bright">
                This element uses the slate grey color for even more contrast when needed.
              </p>
            </div>
          </div>
        </div>
        
        {/* Color Surfaces */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-black border border-moonlight-silver/20">
            <p className="text-sm font-medium">Background (Black)</p>
            <code className="text-xs text-moonlight-silver-dim">--black: oklch(0.12 0.01 0)</code>
          </div>
          
          <div className="p-4 rounded-lg bg-card border border-moonlight-silver/20">
            <p className="text-sm font-medium">Card (Deep Charcoal)</p>
            <code className="text-xs text-moonlight-silver-dim">--deep-charcoal: oklch(0.22 0.02 280)</code>
          </div>
          
          <div className="p-4 rounded-lg bg-muted border border-moonlight-silver/20">
            <p className="text-sm font-medium">Muted (Slate Grey)</p>
            <code className="text-xs text-moonlight-silver-dim">--slate-grey: oklch(0.30 0.025 260)</code>
          </div>
          
          <div className="mt-2 text-xs text-moonlight-silver-dim">
            Each surface has increasing lightness for visual hierarchy
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this component after MoonlightContrastExample
function SurfaceLayersExample() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
       <div className="flex items-center gap-2">
        <Layers3 size={18} className="text-ethereal-teal" />
        <h2 className="text-xl font-medium silver-text">Surface Layers</h2>
      </div>
      <div className="bg-black p-6 rounded-lg">
        <h3 className="text-moonlight-silver-bright mb-4">Background Layer (Black)</h3>
        
        <div className="bg-card p-5 rounded-lg card-elevation-1 mb-4">
          <h4 className="text-moonlight-silver-bright mb-2">Card Layer (Deep Charcoal)</h4>
          
          <div className="bg-muted p-4 rounded-lg card-elevation-2 mb-3">
            <h5 className="text-moonlight-silver-bright mb-2">Muted Layer (Slate Grey)</h5>
            
            <div className="bg-secondary p-3 rounded-lg card-elevation-3">
              <p className="text-secondary-foreground">Content Layer (Moonlight Silver)</p>
            </div>
          </div>
          
          <p className="text-moonlight-silver mt-3 text-sm">
            Each layer uses increasing elevation to create visual hierarchy.
            These distinct surfaces help organize content while maintaining the dark theme.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
        <main className="flex flex-col gap-[32px] row-start-2 items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-col items-center gap-4 w-full">
          <h1 className="text-4xl sm:text-5xl font-light text-moonlight-silver-bright text-center mt-4 mb-6">
            Silver on Black
          </h1>
          <p className="text-lg wispy-text-ethereal text-center max-w-md mb-8 opacity-90 text-moonlight-silver">
            A sleek, high-contrast interface with the shimmering elegance of Moonlight Silver against deep black
          </p>
          
          {/* Call to Action */}
            <Link href="/login">
              <Button size="lg" className="wispy-text-glow">
                Login
              </Button>
            </Link>
        </div>
        
        {/* Add the Wisp Color Palette showcase */}
        <WispColorPalette />
        
        {/* Add UI Examples */}
        <WispUIExamples />
        
        {/* Add Border Examples */}
        <WispBorderExample />
        
        {/* Add Moonlight Silver Contrast Examples */}
        <MoonlightContrastExample />
        
        {/* Add Surface Layers Example */}
        <SurfaceLayersExample />
        
      </main>
     
  );
}
