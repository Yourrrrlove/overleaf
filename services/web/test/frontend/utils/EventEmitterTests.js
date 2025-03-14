import { expect } from 'chai'
import sinon from 'sinon'

import EventEmitter from '@/utils/EventEmitter'

describe('EventEmitter', function () {
  beforeEach(function () {
    this.eventEmitter = new EventEmitter()
  })

  it('calls listeners', function () {
    const cb1 = sinon.stub()
    const cb2 = sinon.stub()
    this.eventEmitter.on('foo', cb1)
    this.eventEmitter.on('bar', cb2)

    this.eventEmitter.trigger('foo')

    expect(cb1).to.have.been.called
    expect(cb2).to.not.have.been.called
  })

  it('calls multiple listeners', function () {
    const cb1 = sinon.stub()
    const cb2 = sinon.stub()
    this.eventEmitter.on('foo', cb1)
    this.eventEmitter.on('foo', cb2)

    this.eventEmitter.trigger('foo')

    expect(cb1).to.have.been.called
    expect(cb2).to.have.been.called
  })

  it('calls listeners with namespace', function () {
    const cb1 = sinon.stub()
    const cb2 = sinon.stub()
    this.eventEmitter.on('foo', cb1)
    this.eventEmitter.on('foo.bar', cb2)

    this.eventEmitter.trigger('foo')

    expect(cb1).to.have.been.called
    expect(cb2).to.have.been.called
  })

  it('removes listeners', function () {
    const cb = sinon.stub()
    this.eventEmitter.on('foo', cb)
    this.eventEmitter.off('foo')

    this.eventEmitter.trigger('foo')

    expect(cb).to.not.have.been.called
  })

  it('removes namespaced listeners', function () {
    const cb = sinon.stub()
    this.eventEmitter.on('foo.bar', cb)
    this.eventEmitter.off('foo.bar')

    this.eventEmitter.trigger('foo')

    expect(cb).to.not.have.been.called
  })

  it('does not remove unnamespaced listeners if off called with namespace', function () {
    const cb1 = sinon.stub()
    const cb2 = sinon.stub()
    this.eventEmitter.on('foo', cb1)
    this.eventEmitter.on('foo.bar', cb2)
    this.eventEmitter.off('foo.bar')

    this.eventEmitter.trigger('foo')

    expect(cb1).to.have.been.called
    expect(cb2).to.not.have.been.called
  })
})
