package store

import (
	"context"

	genericstore "github.com/onexstack/onexstack/pkg/store"
	"github.com/onexstack/onexstack/pkg/store/where"

	"github.com/onexstack/miniblog/internal/apiserver/model"
)

type AINewsStore interface {
	Create(ctx context.Context, obj *model.AINewsM) error
	Update(ctx context.Context, obj *model.AINewsM) error
	Delete(ctx context.Context, opts *where.Options) error
	Get(ctx context.Context, opts *where.Options) (*model.AINewsM, error)
	List(ctx context.Context, opts *where.Options) (int64, []*model.AINewsM, error)

	AINewsExpansion
}

type AINewsExpansion interface{}

type aiNewsStore struct {
	*genericstore.Store[model.AINewsM]
}

var _ AINewsStore = (*aiNewsStore)(nil)

func newAINewsStore(store *datastore) *aiNewsStore {
	return &aiNewsStore{
		Store: genericstore.NewStore[model.AINewsM](store, NewLogger()),
	}
}
