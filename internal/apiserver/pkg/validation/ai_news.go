package validation

import (
	"context"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	genericvalidation "github.com/onexstack/onexstack/pkg/validation"

	"github.com/onexstack/miniblog/internal/pkg/errno"
	apiv1 "github.com/onexstack/miniblog/pkg/api/apiserver/v1"
)

func (v *Validator) ValidateListAINewsRequest(ctx context.Context, rq *apiv1.ListAINewsRequest) error {
	return genericvalidation.ValidateSelectedFields(rq, v.ValidateAINewsRules(), "Offset", "Limit", "SourcePlatform")
}

func (v *Validator) ValidateGetAINewsRequest(ctx context.Context, rq *apiv1.GetAINewsRequest) error {
	if rq.GetId() == "" {
		return errno.ErrInvalidArgument.WithMessage("id cannot be empty")
	}
	return nil
}

func (v *Validator) ValidateRefreshAINewsRequest(ctx context.Context, rq *apiv1.RefreshAINewsRequest) error {
	return nil
}

func (v *Validator) ValidateAINewsRules() genericvalidation.Rules {
	return genericvalidation.Rules{
		"Id": func(value any) error {
			if value.(string) == "" {
				return errno.ErrInvalidArgument.WithMessage("id cannot be empty")
			}
			return nil
		},
		"Title": func(value any) error {
			if value.(string) == "" {
				return errno.ErrInvalidArgument.WithMessage("title cannot be empty")
			}
			return nil
		},
		"SourcePlatform": func(value any) error {
			platform := value.(string)
			validPlatforms := []string{"arxiv", "hackernews", "github"}
			valid := false
			for _, p := range validPlatforms {
				if platform == p {
					valid = true
					break
				}
			}
			if !valid {
				return errno.ErrInvalidArgument.WithMessage("invalid source platform")
			}
			return nil
		},
	}
}
