import fs from 'fs';
import path from 'path';
import { ModelDetailClient } from './ModelDetailClient';

export async function generateStaticParams() {
    try {
        const filePath = path.resolve(process.cwd(), 'public/data/models_search.json');
        if (!fs.existsSync(filePath)) return [];
        const data: { name: string }[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return data.map((model) => ({
            slug: encodeURIComponent(model.name),
        }));
    } catch {
        return [];
    }
}

export default function ModelDetailPage({ params }: { params: { slug: string } }) {
    return <ModelDetailClient slug={params.slug} />;
}
