'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart as BarChartIcon, LineChart, PieChart, Save, Share2, PlusCircle, Trash2, Calendar, Users, MapPin, ArrowRightLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const dimensions = [
  { id: 'date', name: 'Date', icon: Calendar },
  { id: 'region', name: 'Region', icon: MapPin },
  { id: 'txType', name: 'Transaction Type', icon: ArrowRightLeft },
];
const metrics = [
  { id: 'dau', name: 'DAU', icon: Users },
  { id: 'txValue', name: 'Transaction Value', icon: Users },
];
const chartTypes = [
  { id: 'bar', name: 'Bar Chart', icon: BarChartIcon },
  { id: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
];

const mockChartData = [
    { region: 'Addis Ababa', txValue: 4000 },
    { region: 'Oromia', txValue: 3000 },
    { region: 'Amhara', txValue: 2000 },
    { region: 'SNNPR', txValue: 2780 },
    { region: 'Tigray', txValue: 1890 },
];

export default function CustomReportsBuilderPage() {
    const [selectedDimensions, setSelectedDimensions] = useState(['region']);
    const [selectedMetrics, setSelectedMetrics] = useState(['txValue']);
    const [selectedChartType, setSelectedChartType] = useState('bar');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Builder Controls */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
          <CardDescription>Select dimensions and metrics to build your report.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
            <BuilderSection title="Dimensions">
                {dimensions.map(d => (
                    <div key={d.id} className="flex items-center space-x-2">
                        <Checkbox id={d.id} checked={selectedDimensions.includes(d.id)} onCheckedChange={(checked) => {
                            setSelectedDimensions(prev => checked ? [...prev, d.id] : prev.filter(id => id !== d.id))
                        }}/>
                        <Label htmlFor={d.id} className="flex items-center gap-2 font-normal">
                            <d.icon className="h-4 w-4 text-muted-foreground" /> {d.name}
                        </Label>
                    </div>
                ))}
            </BuilderSection>
             <BuilderSection title="Metrics">
                {metrics.map(m => (
                    <div key={m.id} className="flex items-center space-x-2">
                        <Checkbox id={m.id} checked={selectedMetrics.includes(m.id)} onCheckedChange={(checked) => {
                            setSelectedMetrics(prev => checked ? [...prev, m.id] : prev.filter(id => id !== m.id))
                        }} />
                        <Label htmlFor={m.id} className="flex items-center gap-2 font-normal">
                            <m.icon className="h-4 w-4 text-muted-foreground" /> {m.name}
                        </Label>
                    </div>
                ))}
            </BuilderSection>
             <BuilderSection title="Visualization">
                <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                    <SelectTrigger><SelectValue placeholder="Select chart type" /></SelectTrigger>
                    <SelectContent>
                        {chartTypes.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                                <div className="flex items-center gap-2">
                                    <c.icon className="h-4 w-4" /> {c.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </BuilderSection>
        </CardContent>
      </Card>
      
      {/* Preview Pane */}
      <Card className="lg:col-span-3 flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Report Preview</CardTitle>
                    <CardDescription>This is a live preview of the report you are building.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Share2 className="mr-2" /> Share</Button>
                    <Button><Save className="mr-2" /> Save Report</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
             <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(val) => `ETB ${val/1000}k`}/>
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="txValue" name="Transaction Value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
         <CardFooter className="justify-end">
            <Button variant="secondary">Export Data</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const BuilderSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className="grid gap-2">{children}</div>
    </div>
)
