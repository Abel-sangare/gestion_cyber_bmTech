import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Briefcase
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
    totalPrestations: 0,
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
      // 4. Fetch Prestations
      const { data: presData } = await supabase.from('prestations').select('prix, quantite, date');

      const sumIns = insData?.reduce((acc, curr) => acc + (curr.prix_inscription || 0), 0) || 0;
      const sumPay = payData?.reduce((acc, curr) => acc + (curr.montant_paye || 0), 0) || 0;
      const sumDep = depData?.reduce((acc, curr) => acc + (curr.somme || 0), 0) || 0;
      const sumPres = presData?.reduce((acc, curr) => acc + ((curr.prix * curr.quantite) || 0), 0) || 0;

      const revenuBrut = sumIns + sumPay + sumPres;
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
             monthlyData[month].revenus += (item.prix_inscription || item.montant_paye || (item.prix * item.quantite) || 0);
          } else {
             monthlyData[month].depenses += (item.somme || 0);
          }
        });
      };

      processData(insData || [], 'revenus', 'date_inscription');
      processData(payData || [], 'revenus', 'date_creation');
      processData(presData || [], 'revenus', 'date');
      processData(depData || [], 'depenses', 'date_creation');

      const chartData = Object.values(monthlyData);
      
      const compositionData = [
        { name: 'Inscriptions', value: sumIns, color: '#3b82f6' },
        { name: 'Paiements', value: sumPay, color: '#10b981' },
        { name: 'Prestations', value: sumPres, color: '#8b5cf6' },
        { name: 'Dépenses', value: sumDep, color: '#ef4444' }
      ];

      setData({
        totalInscriptions: sumIns,
        totalPaiements: sumPay,
        totalDepenses: sumDep,
        totalPrestations: sumPres,
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Inventaire Financier Général</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{data.totalInscriptions.toLocaleString()} GNF</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paiements</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{data.totalPaiements.toLocaleString()} GNF</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prestations</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{data.totalPrestations.toLocaleString()} GNF</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{data.totalDepenses.toLocaleString()} GNF</div>
          </CardContent>
        </Card>

        <Card className={data.revenuNet >= 0 ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200" : "bg-rose-50 dark:bg-rose-950/20 border-rose-200"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <DollarSign className={`h-4 w-4 ${data.revenuNet >= 0 ? 'text-amber-500' : 'text-rose-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${data.revenuNet >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
              {data.revenuNet.toLocaleString()} GNF
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Group Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-6 w-6" />
            Recette Totale (Chiffre d'Affaire)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-primary">
            {data.revenuBrut.toLocaleString()} <span className="text-xl font-normal">GNF</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Inclut les inscriptions, les paiements de logiciels et les prestations de services.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Graph: Revenue vs Expenses */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Évolution mensuelle : Entrées vs Sorties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                <YAxis 
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                  axisLine={false} 
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => [`${v.toLocaleString()} GNF`, ""]} 
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="revenus" name="Total Revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" name="Total Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Composition */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Répartition des Sources de Revenu
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data.compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => `${v.toLocaleString()} GNF`} 
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
