"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { subscribeAllShipments, subscribeShipment, subscribeUserShipments } from "@/features/shipments/api";

function useSubscription(subscribe, key) {
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    if (!key) return undefined;
    return subscribe(
      (data) => setState({ key, data, error: null }),
      (error) => {
        console.error("[shipments] listener failed", error);
        setState({ key, data: null, error });
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const ready = state.key === key;
  return { data: ready ? state.data : null, error: ready ? state.error : null, loading: !!key && !ready };
}

export function useMyShipments() {
  const { user } = useAuth();
  const { data, error, loading } = useSubscription((ok, err) => subscribeUserShipments(user.uid, ok, err), user?.uid);
  return { shipments: data || [], error, loading };
}

export function useAllShipments() {
  const { data, error, loading } = useSubscription((ok, err) => subscribeAllShipments(ok, err), "all");
  return { shipments: data || [], error, loading };
}

export function useShipment(id) {
  const { data, error, loading } = useSubscription((ok, err) => subscribeShipment(id, ok, err), id);
  return { shipment: data, error, loading };
}
