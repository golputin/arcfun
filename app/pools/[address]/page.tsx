import { PoolDetail } from "@/components/PoolDetail";

export default function PoolPage({ params }: { params: { address: string } }) {
  return <PoolDetail address={params.address} />;
}
