package conversion

import (
	"github.com/onexstack/onexstack/pkg/core"

	"github.com/onexstack/miniblog/internal/apiserver/model"
	apiv1 "github.com/onexstack/miniblog/pkg/api/apiserver/v1"
)

func AINewsModelToAINewsV1(model *model.AINewsM) *apiv1.AINews {
	var protoAINews apiv1.AINews
	_ = core.CopyWithConverters(&protoAINews, model)
	return &protoAINews
}

func AINewsV1ToAINewsModel(protoAINews *apiv1.AINews) *model.AINewsM {
	var modelAINews model.AINewsM
	_ = core.CopyWithConverters(&modelAINews, protoAINews)
	return &modelAINews
}
