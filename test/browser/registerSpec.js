var Marty = require('../../index');

describe('Marty#register', function () {
  describe('Store class', function () {
    var ActualStore, expectedInitialState;

    class ExpectedStore extends Marty.Store {
      getInitialState() {
        return expectedInitialState
      }
      getFoo(id) {
        return this.state[id];
      }
    }

    beforeEach(function () {
      expectedInitialState = {
        123: { foo: 'bar' }
      };

      ActualStore = Marty.register(ExpectedStore);
    });

    it('should return an instance of the store', function () {
      expect(ActualStore).to.exist;
      expect(ActualStore.getState()).to.eql(expectedInitialState);
      expect(ActualStore.getFoo(123)).to.eql(expectedInitialState[123]);
    });
  });
});