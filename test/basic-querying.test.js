// This test written in mocha+should.js
var should = require('./init.js');
var async = require('async');
var db, User;

describe('basic-querying', function () {

  before(function (done) {
    db = getSchema();

    User = db.define('User', {
      seq: {type: Number, index: true},
      name: {type: String, index: true, sort: true},
      email: {type: String, index: true},
      birthday: {type: Date, index: true},
      role: {type: String, index: true},
      order: {type: Number, index: true, sort: true},
      vip: {type: Boolean}
    });

    db.automigrate(done);

  });

  describe('findById', function () {

    before(function (done) {
      User.destroyAll(done);
    });

    it('should query by id: not found', function (done) {
      User.findById(1, function (err, u) {
        should.not.exist(u);
        should.not.exist(err);
        done();
      });
    });

    it('should query by id: found', function (done) {
      User.create(function (err, u) {
        should.not.exist(err);
        should.exist(u.id);
        User.findById(u.id, function (err, u) {
          should.exist(u);
          should.not.exist(err);
          u.should.be.an.instanceOf(User);
          done();
        });
      });
    });

  });

  describe('find', function () {

    before(seed);

    it('should query collection', function (done) {
      User.find(function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users.should.have.lengthOf(6);
        done();
      });
    });

    it('should query limited collection', function (done) {
      User.find({limit: 3}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users.should.have.lengthOf(3);
        done();
      });
    });

    it('should query collection with skip & limit', function (done) {
      User.find({skip: 1, limit: 4, order: 'seq'}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users[0].seq.should.be.eql(1);
        users.should.have.lengthOf(4);
        done();
      });
    });

    it('should query collection with offset & limit', function (done) {
      User.find({offset: 2, limit: 3, order: 'seq'}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users[0].seq.should.be.eql(2);
        users.should.have.lengthOf(3);
        done();
      });
    });

    it('should query filtered collection', function (done) {
      User.find({where: {role: 'lead'}}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users.should.have.lengthOf(2);
        done();
      });
    });

    it('should query collection sorted by numeric field', function (done) {
      User.find({order: 'order'}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users.forEach(function (u, i) {
          u.order.should.eql(i + 1);
        });
        done();
      });
    });

    it('should query collection desc sorted by numeric field', function (done) {
      User.find({order: 'order DESC'}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users.forEach(function (u, i) {
          u.order.should.eql(users.length - i);
        });
        done();
      });
    });

    it('should query collection sorted by string field', function (done) {
      User.find({order: 'name'}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users.shift().name.should.equal('George Harrison');
        users.shift().name.should.equal('John Lennon');
        users.pop().name.should.equal('Stuart Sutcliffe');
        done();
      });
    });

    it('should query collection desc sorted by string field', function (done) {
      User.find({order: 'name DESC'}, function (err, users) {
        should.exists(users);
        should.not.exists(err);
        users.pop().name.should.equal('George Harrison');
        users.pop().name.should.equal('John Lennon');
        users.shift().name.should.equal('Stuart Sutcliffe');
        done();
      });
    });

    it('should support "and" operator that is satisfied', function (done) {
      User.find({where: {and: [
        {name: 'John Lennon'},
        {role: 'lead'}
      ]}}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 1);
        done();
      });
    });

    it('should support "and" operator that is not satisfied', function (done) {
      User.find({where: {and: [
        {name: 'John Lennon'},
        {role: 'member'}
      ]}}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support "or" that is satisfied', function (done) {
      User.find({where: {or: [
        {name: 'John Lennon'},
        {role: 'lead'}
      ]}}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 2);
        done();
      });
    });

    it('should support "or" operator that is not satisfied', function (done) {
      User.find({where: {or: [
        {name: 'XYZ'},
        {role: 'Hello1'}
      ]}}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support date "gte" that is satisfied', function (done) {
      User.find({order: 'seq', where: { birthday: { "gte": new Date('1980-12-08') }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 1);
        users[0].name.should.equal('John Lennon');
        done();
      });
    });

    it('should support date "gt" that is not satisfied', function (done) {
      User.find({order: 'seq', where: { birthday: { "gt": new Date('1980-12-08') }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support date "gt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { birthday: { "gt": new Date('1980-12-07') }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 1);
        users[0].name.should.equal('John Lennon');
        done();
      });
    });

    it('should support date "lt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { birthday: { "lt": new Date('1980-12-07') }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 1);
        users[0].name.should.equal('Paul McCartney');
        done();
      });
    });

    it('should support number "gte" that is satisfied', function (done) {
      User.find({order: 'seq', where: { order: { "gte":  3}
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 4);
        users[0].name.should.equal('George Harrison');
        done();
      });
    });

    it('should support number "gt" that is not satisfied', function (done) {
      User.find({order: 'seq', where: { order: { "gt": 6 }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support number "gt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { order: { "gt": 5 }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 1);
        users[0].name.should.equal('Ringo Starr');
        done();
      });
    });

    it('should support number "lt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { order: { "lt": 2 }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 1);
        users[0].name.should.equal('Paul McCartney');
        done();
      });
    });

    it('should support number "gt" that is satisfied by null value', function (done) {
      User.find({order: 'seq', where: { order: { "gt": null }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support number "lt" that is not satisfied by null value', function (done) {
      User.find({order: 'seq', where: { order: { "lt": null }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support string "gte" that is satisfied by null value', function (done) {
      User.find({order: 'seq', where: { name: { "gte":  null}
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support string "gte" that is satisfied', function (done) {
      User.find({order: 'seq', where: { name: { "gte":  'Paul McCartney'}
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 4);
        users[0].name.should.equal('Paul McCartney');
        done();
      });
    });

    it('should support string "gt" that is not satisfied', function (done) {
      User.find({order: 'seq', where: { name: { "gt": 'xyz' }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support string "gt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { name: { "gt": 'Paul McCartney' }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 3);
        users[0].name.should.equal('Ringo Starr');
        done();
      });
    });

    it('should support string "lt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { name: { "lt": 'Paul McCartney' }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 2);
        users[0].name.should.equal('John Lennon');
        done();
      });
    });

    it('should support boolean "gte" that is satisfied', function (done) {
      User.find({order: 'seq', where: { vip: { "gte":  true}
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 3);
        users[0].name.should.equal('John Lennon');
        done();
      });
    });

    it('should support boolean "gt" that is not satisfied', function (done) {
      User.find({order: 'seq', where: { vip: { "gt": true }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 0);
        done();
      });
    });

    it('should support boolean "gt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { vip: { "gt": false }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 3);
        users[0].name.should.equal('John Lennon');
        done();
      });
    });

    it('should support boolean "lt" that is satisfied', function (done) {
      User.find({order: 'seq', where: { vip: { "lt": true }
      }}, function (err, users) {
        should.not.exist(err);
        users.should.have.property('length', 2);
        users[0].name.should.equal('George Harrison');
        done();
      });
    });


    it('should only include fields as specified', function (done) {
      var remaining = 0;

      function sample(fields) {

        return {
          expect: function (arr) {
            remaining++;
            User.find({fields: fields}, function (err, users) {

              remaining--;
              if (err) return done(err);

              should.exists(users);

              if (remaining === 0) {
                done();
              }

              users.forEach(function (user) {
                var obj = user.toObject();

                Object.keys(obj)
                  .forEach(function (key) {
                    // if the obj has an unexpected value
                    if (obj[key] !== undefined && arr.indexOf(key) === -1) {
                      console.log('Given fields:', fields);
                      console.log('Got:', key, obj[key]);
                      console.log('Expected:', arr);
                      throw new Error('should not include data for key: ' + key);
                    }
                  });
              });
            });
          }
        }
      }

      sample({name: true}).expect(['name']);
      sample({name: false}).expect(['id', 'seq', 'email', 'role', 'order', 'birthday', 'vip']);
      sample({name: false, id: true}).expect(['id']);
      sample({id: true}).expect(['id']);
      sample('id').expect(['id']);
      sample(['id']).expect(['id']);
      sample(['email']).expect(['email']);
    });

  });

  describe('count', function () {

    before(seed);

    it('should query total count', function (done) {
      User.count(function (err, n) {
        should.not.exist(err);
        should.exist(n);
        n.should.equal(6);
        done();
      });
    });

    it('should query filtered count', function (done) {
      User.count({role: 'lead'}, function (err, n) {
        should.not.exist(err);
        should.exist(n);
        n.should.equal(2);
        done();
      });
    });
  });

  describe('findOne', function () {

    before(seed);

    it('should find first record (default sort by id)', function (done) {
      User.all({order: 'id'}, function (err, users) {
        User.findOne(function (e, u) {
          should.not.exist(e);
          should.exist(u);
          u.id.toString().should.equal(users[0].id.toString());
          done();
        });
      });
    });

    it('should find first record', function (done) {
      User.findOne({order: 'order'}, function (e, u) {
        should.not.exist(e);
        should.exist(u);
        u.order.should.equal(1);
        u.name.should.equal('Paul McCartney');
        done();
      });
    });

    it('should find last record', function (done) {
      User.findOne({order: 'order DESC'}, function (e, u) {
        should.not.exist(e);
        should.exist(u);
        u.order.should.equal(6);
        u.name.should.equal('Ringo Starr');
        done();
      });
    });

    it('should find last record in filtered set', function (done) {
      User.findOne({
        where: {role: 'lead'},
        order: 'order DESC'
      }, function (e, u) {
        should.not.exist(e);
        should.exist(u);
        u.order.should.equal(2);
        u.name.should.equal('John Lennon');
        done();
      });
    });

    it('should work even when find by id', function (done) {
      User.findOne(function (e, u) {
        User.findOne({where: {id: u.id}}, function (err, user) {
          should.not.exist(err);
          should.exist(user);
          done();
        });
      });
    });

  });

  describe('exists', function () {

    before(seed);

    it('should check whether record exist', function (done) {
      User.findOne(function (e, u) {
        User.exists(u.id, function (err, exists) {
          should.not.exist(err);
          should.exist(exists);
          exists.should.be.ok;
          done();
        });
      });
    });

    it('should check whether record not exist', function (done) {
      User.destroyAll(function () {
        User.exists(42, function (err, exists) {
          should.not.exist(err);
          exists.should.not.be.ok;
          done();
        });
      });
    });

  });

  describe('destroyAll with where option', function () {

    before(seed);

    it('should only delete instances that satisfy the where condition', function (done) {
      User.destroyAll({name: 'John Lennon'}, function () {
        User.find({where: {name: 'John Lennon'}}, function (err, data) {
          should.not.exist(err);
          data.length.should.equal(0);
          User.find({where: {name: 'Paul McCartney'}}, function (err, data) {
            should.not.exist(err);
            data.length.should.equal(1);
            done();
          });
        });
      });
    });

  });

  describe('updateAll ', function () {

    beforeEach(seed);

    it('should only update instances that satisfy the where condition', function (done) {
      User.update({name: 'John Lennon'}, {name: 'John Smith'}, function () {
        User.find({where: {name: 'John Lennon'}}, function (err, data) {
          should.not.exist(err);
          data.length.should.equal(0);
          User.find({where: {name: 'John Smith'}}, function (err, data) {
            should.not.exist(err);
            data.length.should.equal(1);
            done();
          });
        });
      });
    });

    it('should update all instances without where', function (done) {
      User.update({name: 'John Smith'}, function () {
        User.find({where: {name: 'John Lennon'}}, function (err, data) {
          should.not.exist(err);
          data.length.should.equal(0);
          User.find({where: {name: 'John Smith'}}, function (err, data) {
            should.not.exist(err);
            data.length.should.equal(6);
            done();
          });
        });
      });
    });

  });

});

function seed(done) {
  var beatles = [
    {
      seq: 0,
      name: 'John Lennon',
      email: 'john@b3atl3s.co.uk',
      role: 'lead',
      birthday: new Date('1980-12-08'),
      order: 2,
      vip: true
    },
    {
      seq: 1,
      name: 'Paul McCartney',
      email: 'paul@b3atl3s.co.uk',
      role: 'lead',
      birthday: new Date('1942-06-18'),
      order: 1,
      vip: true
    },
    {seq: 2, name: 'George Harrison', order: 5, vip: false},
    {seq: 3, name: 'Ringo Starr', order: 6, vip: false},
    {seq: 4, name: 'Pete Best', order: 4},
    {seq: 5, name: 'Stuart Sutcliffe', order: 3, vip: true}
  ];

  async.series([
    User.destroyAll.bind(User),
    function(cb) {
      async.each(beatles, User.create.bind(User), cb);
    }
  ], done);
}
