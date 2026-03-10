// Copyright 2024 孔令飞 <colin404@foxmail.com>. All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file. The original repo for
// this file is https://github.com/onexstack/miniblog. The professional
// version of this repository is https://github.com/onexstack/onex.

package biz

import (
	"github.com/google/wire"
	"github.com/onexstack/onexstack/pkg/authz"

	ainewsv1 "github.com/onexstack/miniblog/internal/apiserver/biz/v1/ai_news"
	postv1 "github.com/onexstack/miniblog/internal/apiserver/biz/v1/post"
	userv1 "github.com/onexstack/miniblog/internal/apiserver/biz/v1/user"
	"github.com/onexstack/miniblog/internal/apiserver/store"
)

// ProviderSet 是一个 Wire 的 Provider 集合，用于声明依赖注入的规则.
// 包含 NewBiz 构造函数，用于生成 biz 实例.
// wire.Bind 用于将接口 IBiz 与具体实现 *biz 绑定，
// 这样依赖 IBiz 的地方会自动注入 *biz 实例.
var ProviderSet = wire.NewSet(NewBiz, wire.Bind(new(IBiz), new(*biz)))

// IBiz 定义了业务层需要实现的方法.
type IBiz interface {
	UserV1() userv1.UserBiz
	PostV1() postv1.PostBiz
	AINewsV1() ainewsv1.AINewsBiz
}

// biz 是 IBiz 的一个具体实现.
type biz struct {
	store store.IStore
	authz *authz.Authz
}

// 确保 biz 实现了 IBiz 接口.
var _ IBiz = (*biz)(nil)

// NewBiz 创建一个 IBiz 类型的实例.
func NewBiz(store store.IStore, authz *authz.Authz) *biz {
	return &biz{store: store, authz: authz}
}

// UserV1 返回一个实现了 UserBiz 接口的实例.
func (b *biz) UserV1() userv1.UserBiz {
	return userv1.New(b.store, b.authz)
}

// PostV1 返回一个实现了 PostBiz 接口的实例.
func (b *biz) PostV1() postv1.PostBiz {
	return postv1.New(b.store)
}

func (b *biz) AINewsV1() ainewsv1.AINewsBiz {
	return ainewsv1.New(b.store)
}
