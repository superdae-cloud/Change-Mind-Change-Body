const OWNER = 'superdae-cloud';
const REPO = 'Change-Mind-Change-Body';
const BRANCH = 'main';

function apiPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function getFile(path: string): Promise<{ sha: string; content: string } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${apiPath(path)}?ref=${BRANCH}`,
    { headers: authHeaders() },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { sha: string; content: string };
  return { sha: data.sha, content: Buffer.from(data.content, 'base64').toString('utf-8') };
}

export async function getFileContent(path: string): Promise<string | null> {
  const file = await getFile(path);
  return file?.content ?? null;
}

export async function getFileSha(path: string): Promise<string | null> {
  const file = await getFile(path);
  return file?.sha ?? null;
}

export async function listDirectory(path: string): Promise<{ name: string; path: string }[]> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${apiPath(path)}?ref=${BRANCH}`,
    { headers: authHeaders() },
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data.map((entry) => ({ name: (entry as { name: string }).name, path: (entry as { path: string }).path }));
}

export async function putFile(path: string, content: string, message: string): Promise<void> {
  const sha = await getFileSha(path);
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${apiPath(path)}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
  }
}

export async function deleteFile(path: string, message: string): Promise<void> {
  const sha = await getFileSha(path);
  if (!sha) throw new Error(`Cannot delete ${path}: file not found`);
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${apiPath(path)}`, {
    method: 'DELETE',
    headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (!res.ok) {
    throw new Error(`GitHub DELETE ${path} failed: ${res.status} ${await res.text()}`);
  }
}
