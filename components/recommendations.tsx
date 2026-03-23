import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"
import { recommendations } from "@/lib/data"

export function Recommendations() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Recommendations for Mike</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {recommendations.map((rec) => (
            <li key={rec.id} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground">
                <Lightbulb className="h-3 w-3 text-background" />
              </div>
              <p className="text-xs leading-relaxed text-foreground">
                {rec.text}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
