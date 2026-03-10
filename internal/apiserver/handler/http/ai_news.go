package http

import (
	"github.com/gin-gonic/gin"
	"github.com/onexstack/onexstack/pkg/core"
)

func (h *Handler) ListAINews(c *gin.Context) {
	core.HandleQueryRequest(c, h.biz.AINewsV1().List, h.val.ValidateListAINewsRequest)
}

func (h *Handler) GetAINews(c *gin.Context) {
	core.HandleUriRequest(c, h.biz.AINewsV1().Get, h.val.ValidateGetAINewsRequest)
}

func (h *Handler) RefreshAINews(c *gin.Context) {
	core.HandleJSONRequest(c, h.biz.AINewsV1().Refresh, h.val.ValidateRefreshAINewsRequest)
}
