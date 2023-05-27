import { promptList} from "@/app/page"
export default function Prompts() {
    return (
            <>
                {promptList.map((prompt) => (
                    <option key={prompt.name} value={prompt.name}>{prompt.name}</option>
                ))}
            </>
    )
}