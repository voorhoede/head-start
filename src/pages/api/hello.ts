export function GET() {
  return new Response(JSON.stringify({ 'title': 'Hello' }));
}
