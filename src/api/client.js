export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
export async function apiFetch(path, init) {
    const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
    });
    if (!res.ok) {
        throw new ApiError(`Request failed: ${res.status}`, res.status);
    }
    return (await res.json());
}
