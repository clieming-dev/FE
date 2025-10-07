import createClient from "openapi-fetch";
import { paths } from "@/shared/api/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetch = createClient<paths>({ baseUrl });
