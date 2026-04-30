import path from "node:path"

export const AGENT_LOCATION = path.resolve(process.cwd(), 'assets', 'agents')

export class Agent {
    name: string
    markdownPath: string
    markdownAbsPath: string

    constructor(name: string, markdown: string) {
        this.name = name
        this.markdownPath = markdown
        this.markdownAbsPath = path.resolve(AGENT_LOCATION, markdown)
    }
}