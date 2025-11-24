"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
// Borramos import Sidebar
import Card from '../components/Card';

export default function RankingPage() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data } = await supabase.from('players').select('*').order('points', { ascending: false });
      setPlayers(data || []);
    };
    fetchRanking();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Ranking Oficial</h2>
      <Card className="max-w-4xl mx-auto overflow-hidden p-0">
          <table className="w-full text-left">
              <thead className="bg-gray-800 text-white uppercase text-xs">
                  <tr>
                      <th className="p-4">Pos</th>
                      <th className="p-4">Jugador</th>
                      <th className="p-4">Nivel</th>
                      <th className="p-4 text-right">Puntos</th>
                  </tr>
              </thead>
              <tbody className="divide-y">
                  {players.map((p, index) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-4 font-bold text-gray-400">#{index + 1}</td>
                          <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'}`}>
                                  {p.name.charAt(0)}
                              </div>
                              {p.name}
                          </td>
                          <td className="p-4 text-sm text-gray-500">{p.level}</td>
                          <td className="p-4 text-right font-mono font-bold text-blue-600 text-lg">{p.points} pts</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </Card>
    </main>
  );
}