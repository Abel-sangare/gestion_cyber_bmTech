import { useState, useEffect } from "react";
import { Users, ClipboardList, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpisData, setKpisData] = useState({
    totalStudents: 0,
    totalInscriptions: 0,
    totalRevenues: 0,
    pendingPaymentsCount: 0,
    // Add pendingPaymentsAmount if needed for a KPI card
  });
  const [monthlyRevenues, setMonthlyRevenues] = useState<any[]>([]);
  const [inscriptionsByLogiciel, setInscriptionsByLogiciel] = useState<any[]>([]);
  const [recentInscriptions, setRecentInscriptions] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch KPI Data
      const { count: studentsCount, error: studentsError } = await supabase
        .from('etudiants')
        .select('count', { count: 'exact' });
      if (studentsError) throw studentsError;

      const { count: inscriptionsCount, error: inscriptionsError } = await supabase
        .from('inscriptions')
        .select('count', { count: 'exact' });
      if (inscriptionsError) throw inscriptionsError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('paiements')
        .select('montant_total, montant_paye, est_solde, date_premier_paiement');
      if (paymentsError) throw paymentsError;

      let totalRevenues = 0;
      let pendingPaymentsCount = 0;
      if (paymentsData) {
        totalRevenues = paymentsData.reduce((sum, p) => sum + p.montant_paye, 0);
        pendingPaymentsCount = paymentsData.filter(p => !p.est_solde).length;
      }

      setKpisData({
        totalStudents: studentsCount || 0,
        totalInscriptions: inscriptionsCount || 0,
        totalRevenues,
        pendingPaymentsCount,
      });

      // Fetch Monthly Revenues (Client-side aggregation)
      const monthlyRevMap = new Map<string, number>();
      if (paymentsData) {
        paymentsData.forEach(p => {
          if (p.date_premier_paiement) {
            const date = new Date(p.date_premier_paiement);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyRevMap.set(monthYear, (monthlyRevMap.get(monthYear) || 0) + p.montant_paye);
          }
        });
      }
      const sortedMonthlyRevenues = Array.from(monthlyRevMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthYear, revenus]) => ({ mois: monthYear, revenus }));
      setMonthlyRevenues(sortedMonthlyRevenues);


      // Fetch Inscriptions by Logiciel (Client-side aggregation)
      const { data: inscriptionsByLogicielData, error: insByLogicielError } = await supabase
        .from('inscriptions')
        .select('logiciels(nom)');
      if (insByLogicielError) throw insByLogicielError;

      const logicielCounts = new Map<string, number>();
      if (inscriptionsByLogicielData) {
        inscriptionsByLogicielData.forEach(ins => {
          const logicielNom = ins.logiciels?.nom || 'Inconnu';
          logicielCounts.set(logicielNom, (logicielCounts.get(logicielNom) || 0) + 1);
        });
      }
      const formattedInscriptionsByLogiciel = Array.from(logicielCounts.entries())
        .map(([formation, inscrits]) => ({ formation, inscrits }));
      setInscriptionsByLogiciel(formattedInscriptionsByLogiciel);

      // Fetch Recent Inscriptions
      const { data: recentInsData, error: recentInsError } = await supabase
        .from('inscriptions')
        .select('*, etudiants(nom, prenom), logiciels(nom)')
        .limit(5);
      if (recentInsError) throw recentInsError;
      setRecentInscriptions(recentInsData || []);

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { label: "Étudiants total", value: kpisData.totalStudents, icon: Users, change: "+12%", up: true, color: "bg-primary/10 text-primary" },
    { label: "Inscriptions", value: kpisData.totalInscriptions, icon: ClipboardList, change: "+8%", up: true, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { label: "Revenus totaux", value: `${kpisData.totalRevenues.toLocaleString()} GNF`, icon: TrendingUp, change: "+15%", up: true, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { label: "Paiements en attente", value: kpisData.pendingPaymentsCount, icon: AlertCircle, change: "-3%", up: false, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  ];

  if (loading) {
    return <div className="p-4 text-center">Chargement du tableau de bord...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    {kpi.up ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={kpi.up ? "text-green-500" : "text-red-500"}>{kpi.change}</span>
                  </div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Revenus mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyRevenues}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} GNF`, "Revenus"]} />
                <Line type="monotone" dataKey="revenus" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Inscriptions par logiciel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={inscriptionsByLogiciel}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="formation" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="inscrits" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent inscriptions */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Inscriptions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Logiciel</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInscriptions.slice(0, 5).map((ins) => (
                <TableRow key={ins.id}>
                  <TableCell className="font-medium">{ins.etudiants?.nom} {ins.etudiants?.prenom}</TableCell>
                  <TableCell>{ins.logiciels?.nom}</TableCell>
                  <TableCell>{new Date(ins.date_creation).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ins.statut === "termine" ? "default" : ins.statut === "abandon" ? "destructive" : "secondary"}
                    >
                      {ins.statut}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
