describe("Hello", function() {

    it("says hello to receiver", function() {
        expect(sayHello('Ueli')).toBe("Hello, Ueli!");
    });
});