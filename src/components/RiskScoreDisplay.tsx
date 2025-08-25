"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, TrendingUp, MapPin, Calendar, DollarSign, Building } from "lucide-react"
import { RiskScore, RiskComponents, getRiskColor } from "@/lib/risk"

interface RiskScoreDisplayProps {
  riskScore: RiskScore
  showComponents?: boolean
  compact?: boolean
}

export function RiskScoreDisplay({ 
  riskScore, 
  showComponents = false, 
  compact = false 
}: RiskScoreDisplayProps) {
  const { score, level, components } = riskScore

  if (compact) {
    return (
      <Badge className={getRiskColor(level)}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        {score}/100
      </Badge>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Risk Score</span>
            <Badge className={getRiskColor(level)} variant="outline">
              {level.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Progress 
              value={score} 
              className="flex-1 h-3"
              // Add color based on risk level
              style={{
                '--progress-background': level === 'critical' ? '#dc2626' : 
                                       level === 'high' ? '#ea580c' :
                                       level === 'medium' ? '#ca8a04' : '#16a34a'
              } as React.CSSProperties}
            />
            <span className="text-lg font-bold min-w-[4rem]">{score}/100</span>
          </div>
        </div>

        {/* Risk Level Description */}
        <div className="text-sm text-muted-foreground">
          {getRiskDescription(level)}
        </div>

        {/* Component Breakdown */}
        {showComponents && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-medium">Risk Factors</h4>
            <div className="grid grid-cols-1 gap-2">
              <RiskComponent 
                icon={<Building className="h-4 w-4" />}
                label="Scam Category"
                value={components.category}
                description="Risk level of this type of scam"
              />
              <RiskComponent 
                icon={<MapPin className="h-4 w-4" />}
                label="Area Risk"
                value={components.proximity}
                description="Number of incidents nearby"
              />
              <RiskComponent 
                icon={<Calendar className="h-4 w-4" />}
                label="Recency"
                value={components.recency}
                description="How recent this incident is"
              />
              <RiskComponent 
                icon={<DollarSign className="h-4 w-4" />}
                label="Financial Impact"
                value={components.financial}
                description="Reported financial loss"
              />
              <RiskComponent 
                icon={<TrendingUp className="h-4 w-4" />}
                label="Incident Volume"
                value={components.volume}
                description="Similar incidents reported"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface RiskComponentProps {
  icon: React.ReactNode
  label: string
  value: number
  description: string
}

function RiskComponent({ icon, label, value, description }: RiskComponentProps) {
  const percentage = Math.round(value * 100)
  
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 flex-1">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-[5rem]">
        <Progress value={percentage} className="w-12 h-2" />
        <span className="text-xs font-medium w-8 text-right">{percentage}%</span>
      </div>
    </div>
  )
}

function getRiskDescription(level: string): string {
  switch (level) {
    case 'critical':
      return 'Very high risk area with multiple recent incidents. Exercise extreme caution.'
    case 'high':
      return 'High risk location with several reported incidents. Be very careful.'
    case 'medium':
      return 'Moderate risk area with some reported incidents. Stay alert.'
    case 'low':
      return 'Lower risk area with few incidents. Normal precautions recommended.'
    default:
      return 'Risk assessment unavailable.'
  }
}
