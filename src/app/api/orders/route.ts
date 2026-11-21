import { NextResponse } from "next/server";
import { EXPECTED_ORDER_COUNT, ORDERS } from "@/lib/orders";

export async function GET() {
  return NextResponse.json({
    count: EXPECTED_ORDER_COUNT,
    orders: ORDERS,
  });
}
