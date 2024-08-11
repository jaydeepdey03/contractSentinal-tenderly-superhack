export const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3",
    yaml: "0.1.0",
};

export type Language = keyof typeof LANGUAGE_VERSIONS;

export const CODE_SNIPPETS: { [key in Language]: string } = {
    "javascript": `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    "typescript": `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
    "python": `def greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    "java": `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    "csharp":
        'using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
    "php": "<?php\n\n$name = 'Alex';\necho $name;\n",
    "yaml": `name: Alex\nage: 25\n`,
};


export const pythonCode = `# This is the code snippet fetch token variables from API
import requests

def fetchData(api_url):
\tres = requests.get(api_url)
\tdata = res.json()

# greet("Alex")
# This is for token details
fetchData("https://loomhub.onrender.com/getTokenDetailsLatest?symbol=WETH")

# This is for past token details, num is the number of previous epochs values
fetchData("https://loomhub.onrender.com/getTokenPrice?num=5&symbol=WETH")



# Save the figure as plot.png to visualize the graph in the visualizer
import matplotlib.pyplot as plt
plt.savefig('plot.png')
`;