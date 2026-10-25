import { useEffect, useState } from "react";

export function NetworkNotice() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return online ? null : <p role="status" className="border-b border-line bg-mist px-5 py-3 text-center text-sm text-navy">Você está sem conexão. Mantenha esta página aberta e confira o salvamento dos projetos quando a internet voltar.</p>;
}
