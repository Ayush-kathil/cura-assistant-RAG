export class BM25 {
  private documentLengths: Map<string, number> = new Map();
  private termFrequencies: Map<string, Map<string, number>> = new Map();
  private documentFrequencies: Map<string, number> = new Map();
  private averageDocumentLength: number = 0;
  private totalDocuments: number = 0;
  private k1: number = 1.2;
  private b: number = 0.75;

  constructor(docs: { id: string; text: string }[]) {
    this.totalDocuments = docs.length;
    let totalLength = 0;

    docs.forEach(doc => {
      const tokens = this.tokenize(doc.text);
      this.documentLengths.set(doc.id, tokens.length);
      totalLength += tokens.length;

      const docTf = new Map<string, number>();
      const uniqueTokens = new Set<string>();

      tokens.forEach(token => {
        docTf.set(token, (docTf.get(token) || 0) + 1);
        uniqueTokens.add(token);
      });

      this.termFrequencies.set(doc.id, docTf);

      uniqueTokens.forEach(token => {
        this.documentFrequencies.set(token, (this.documentFrequencies.get(token) || 0) + 1);
      });
    });

    if (this.totalDocuments > 0) {
      this.averageDocumentLength = totalLength / this.totalDocuments;
    }
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }

  private computeIdf(term: string): number {
    const df = this.documentFrequencies.get(term) || 0;
    return Math.log((this.totalDocuments - df + 0.5) / (df + 0.5) + 1);
  }

  public search(query: string): { id: string; score: number }[] {
    const queryTokens = this.tokenize(query);
    const scores: { id: string; score: number }[] = [];

    this.documentLengths.forEach((docLength, docId) => {
      let docScore = 0;
      const docTf = this.termFrequencies.get(docId)!;

      queryTokens.forEach(token => {
        const tf = docTf.get(token) || 0;
        if (tf > 0) {
          const idf = this.computeIdf(token);
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / this.averageDocumentLength));
          docScore += idf * (numerator / denominator);
        }
      });

      if (docScore > 0) {
        scores.push({ id: docId, score: docScore });
      }
    });

    return scores.sort((a, b) => b.score - a.score);
  }
}
