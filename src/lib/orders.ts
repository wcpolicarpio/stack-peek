export type Order = {
  id: string;
  customer: string;
  email: string;
  sku: string;
  amountCents: number;
  status: "paid" | "refunded" | "pending";
};

/** Fixed fixture — row count is the oracle for export correctness. */
export const ORDERS: Order[] = [
  {
    id: "ord_1001",
    customer: "Ada Lovelace",
    email: "ada@analytical.engine",
    sku: "DIFF-ENG",
    amountCents: 4200,
    status: "paid",
  },
  {
    id: "ord_1002",
    customer: "Grace Hopper",
    email: "grace@cobol.navy",
    sku: "COMPILER",
    amountCents: 8800,
    status: "paid",
  },
  {
    id: "ord_1003",
    customer: "Alan Turing",
    email: "alan@bletchley.uk",
    sku: "ENIGMA",
    amountCents: 12000,
    status: "pending",
  },
  {
    id: "ord_1004",
    customer: "Katherine Johnson",
    email: "kj@nasa.gov",
    sku: "ORBIT",
    amountCents: 5600,
    status: "paid",
  },
  {
    id: "ord_1005",
    customer: "Donald Knuth",
    email: "don@artofprog.edu",
    sku: "TAOCP",
    amountCents: 9900,
    status: "paid",
  },
  {
    id: "ord_1006",
    customer: "Barbara Liskov",
    email: "barb@mit.edu",
    sku: "CLU",
    amountCents: 7300,
    status: "refunded",
  },
  {
    id: "ord_1007",
    customer: "Edsger Dijkstra",
    email: "ewd@utrecht.nl",
    sku: "SEMA",
    amountCents: 3100,
    status: "paid",
  },
  {
    id: "ord_1008",
    customer: "Margaret Hamilton",
    email: "mh@apollo.mit",
    sku: "AGC",
    amountCents: 15000,
    status: "paid",
  },
  {
    id: "ord_1009",
    customer: "Linus Torvalds",
    email: "torvalds@linux.org",
    sku: "KERNEL",
    amountCents: 6400,
    status: "pending",
  },
  {
    id: "ord_1010",
    customer: "Leslie Lamport",
    email: "lamport@tla.plus",
    sku: "Paxos",
    amountCents: 8700,
    status: "paid",
  },
  {
    id: "ord_1011",
    customer: "Fran Allen",
    email: "fran@ibm.com",
    sku: "OPT",
    amountCents: 4500,
    status: "paid",
  },
  {
    id: "ord_1012",
    customer: "John Carmack",
    email: "john@id.software",
    sku: "QUAKE",
    amountCents: 1999,
    status: "refunded",
  },
];

export const EXPECTED_ORDER_COUNT = ORDERS.length;
