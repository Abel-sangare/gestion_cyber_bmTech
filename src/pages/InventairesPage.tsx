import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from "recharts";
import { supabase } from "@/lib/supabase";

export default function InventairesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalInscriptions: 0,
    totalPaiements: 0,
    totalDepenses: 0,
    revenuBrut: 0,
    revenuNet: 0,
    chartData: [] as any[],
    compositionData: [] as any[]
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Inscriptions
      const { data: insData } = await supabase.from('inscriptions').select('prix_inscription, date_inscription');
      // 2. Fetch Paiements
      const { data: payData } = await supabase.from('paiements').select('montant_paye, date_creation');
      // 3. Fetch Depenses
      const { data: depData } = await supabase.from('depenses').select('somme, date_creation');

      const sumIns = insData?.reduce((acc, curr) => acc + (curr.prix_inscription || 0), 0) || 0;
      const sumPay = payData?.reduce((acc, curr) => acc + (curr.montant_paye || 0), 0) || 0;
      const sumDep = depData?.reduce((acc, curr) => acc + (curr.somme || 0), 0) || 0;

      const revenuBrut = sumIns + sumPay;
      const revenuNet = revenuBrut - sumDep;

      // Group by month for charts
      const monthlyData: any = {};

      const processData = (arr: any[], key: string, dateKey: string) => {
        arr?.forEach(item => {
          const rawDate = item[dateKey];
          if (!rawDate) return;
          
          const date = new Date(rawDate);
          if (isNaN(date.getTime())) return;

          const month = date.toLocaleString('default', { month: 'short' });
          if (!monthlyData[month]) monthlyData[month] = { month, revenus: 0, depenses: 0 };
          
          if (key === 'revenus') {
             monthlyData[month].revenus += (item.prix_inscription || item.montant_paye || 0);
          } else {
             monthlyData[month].depenses += (item.somme || 0);
          }
        });
      };

      processData(insData || [], 'revenus', 'date_inscription');
      processData(payData || [], 'revenus', 'date_creation');
      processData(depData || [], 'depenses', 'date_creation');

      const chartData = Object.values(monthlyData);
      
      const compositionData = [
        { name: 'Inscriptions', value: sumIns, color: '#3b82f6' },
        { name: 'Paiements', value: sumPay, color: '#10b981' },
        { name: 'Dépenses', value: sumDep, color: '#ef4444' }
      ];

      setData({
        totalInscriptions: sumIns,
        totalPaiements: sumPay,
        totalDepenses: sumDep,
        revenuBrut,
        revenuNet,
        chartData,
        compositionData
      });
    } catch (error) {
      console.error("Erreur inventaire:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement de l'inventaire...</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Inventaire Financier</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Inscriptions</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.totalInscriptions.toLocaleString()} GNF</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paiements</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.totalPaiements.toLocaleString()} GNF</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.totalDepenses.toLocaleString()} GNF</div>
          </CardContent>
        </Card>

        <Card className={data.revenuNet >= 0 ? "bg-amber-50 dark:bg-amber-950/20" : "bg-rose-50 dark:bg-rose-950/20"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenu Net (Bénéfice)</CardTitle>
            <DollarSign className={`h-4 w-4 ${data.revenuNet >= 0 ? 'text-amber-500' : 'text-rose-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.revenuNet >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
              {data.revenuNet.toLocaleString()} GNF
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inscrip. + Paiem. - Dépenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Group Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Récapitulatif des Entrées (Total Brut)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-primary">
            {data.revenuBrut.toLocaleString()} <span className="text-lg font-normal">GNF</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Graph: Revenue vs Expenses */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Évolution : Revenus vs Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} GNF`, ""]} />
                <Legend />
                <Bar dataKey="revenus" name="Revenus (Entrées)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Composition */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Répartition Financière
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} GNF`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
