const {expect} = require('chai');
const {matches} = require('../../lib/tag-info');

describe('tag-info', () => {
  describe('matches()', () => {
    it('should match one level cases', () => {
      expect(
        matches(
          [
            {tagName: 'div'}
          ],
          [[
            {tagName: 'div'}
          ]]
        )
      ).to.equal(true);
    });

    it('should match multi-selector', () => {
      expect(
        matches(
          [
            {tagName: 'div'}
          ],
          [
            [{tagName: 'div'}],
            [{tagName: 'span'}]
          ]
        )
      ).to.equal(true);
    });

    it('should match star', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'span'}
          ],
          [[{tagName: 'div'}, {tagName: 'span'}]]
        )
      ).to.equal(true);
    });

    it('should not match non-existing star', () => {
      expect(
        matches(
          [
            {tagName: 'span'},
            {tagName: 'div'}
          ],
          [[{tagName: 'div'}, {}]]
        )
      ).to.equal(false);
    });

    it('should match two level cases', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'div'}
          ],
          [[
            {tagName: 'div'},
            {tagName: 'div'}
          ]]
        )
      ).to.equal(true);
    });

    it('should match over a level', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'span'},
            {tagName: 'div'}
          ],
          [[
            {tagName: 'div'},
            {tagName: 'div'}
          ]]
        )
      ).to.equal(true);
    });

    it('should match over two levels', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'span'},
            {tagName: 'div'},
            {tagName: 'span'},
            {tagName: 'div'}
          ],
          [[
            {tagName: 'div'},
            {tagName: 'div'},
            {tagName: 'div'}
          ]]
        )
      ).to.equal(true);
    });

    it('should not match if parent wasn\'t found', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'span'}
          ],
          [[
            {tagName: 'div'},
            {tagName: 'div'}
          ]]
        )
      ).to.equal(false);
    });

    it('should match with direct parent', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'div'}
          ],
          [[
            {tagName: 'div'},
            {tagName: 'div', nestingOperator: '>'}
          ]]
        )
      ).to.equal(true);
    });

    it('should match with mixed nesting', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'span'},
            {tagName: 'div'},
            {tagName: 'div'}
          ],
          [[
            {tagName: 'div'},
            {tagName: 'div'},
            {tagName: 'div', nestingOperator: '>'}
          ]]
        )
      ).to.equal(true);
    });

    it('should not match with indirect parent', () => {
      expect(
        matches(
          [
            {tagName: 'div'},
            {tagName: 'span'},
            {tagName: 'div'}
          ],
          [[
            {tagName: 'div'},
            {tagName: 'div', nestingOperator: '>'}
          ]]
        )
      ).to.equal(false);
    });

    describe('attributes', () => {
      describe('=', () => {
        it('should match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: '/'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '=', value: '/'}]}]]
            )
          ).to.equal(true);
        });
        it('should not match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: '/'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '=', value: '#'}]}]]
            )
          ).to.equal(false);
        });
      });

      describe('^=', () => {
        it('should match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '^=', value: 'ab'}]}]]
            )
          ).to.equal(true);
        });
        it('should not match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '^=', value: 'bc'}]}]]
            )
          ).to.equal(false);
        });
      });

      describe('$=', () => {
        it('should match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '$=', value: 'bc'}]}]]
            )
          ).to.equal(true);
        });
        it('should not match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '$=', value: 'ab'}]}]]
            )
          ).to.equal(false);
        });
      });

      describe('*=', () => {
        it('should match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '*=', value: 'b'}]}]]
            )
          ).to.equal(true);
        });
        it('should not match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '*=', value: 'bb'}]}]]
            )
          ).to.equal(false);
        });
      });

      describe('~=', () => {
        it('should match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc def'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '~=', value: 'abc'}]}]]
            )
          ).to.equal(true);
        });
        it('should not match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc def'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '~=', value: 'c d'}]}]]
            )
          ).to.equal(false);
        });
      });

      describe('|=', () => {
        it('should match on exact match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '|=', value: 'abc'}]}]]
            )
          ).to.equal(true);
        });
        it('should match as prefix', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc-def'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '|=', value: 'abc'}]}]]
            )
          ).to.equal(true);
        });
        it('should not match', () => {
          expect(
            matches(
              [{tagName: 'div', attrs: {href: 'abc def'}}],
              [[{tagName: 'div', attrs: [{name: 'href', operator: '|=', value: 'abc'}]}]]
            )
          ).to.equal(false);
        });
      });
    });
  });
});
