const compiler = require('./compile')

test('Inserts name and outputs JavaScript', async () => {
    const stats = await compiler('./fixture/ts-fc.tsx');

    const output = stats.toJson().modules[0].source;

    expect(output.includes('data-inspector-filename')).toBeTruthy()
    expect(output.includes('data-inspector-line')).toBeTruthy()
    expect(output.includes('data-inspector-column')).toBeTruthy()
});